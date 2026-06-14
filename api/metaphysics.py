# -*- coding: utf-8 -*-
from datetime import datetime
from http.server import BaseHTTPRequestHandler
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from metaphysics_core.bazi import BaziEngine
from metaphysics_core.calendar import get_true_solar_time, get_lunar

MAX_BODY_BYTES = 64 * 1024

KNOWN_LOCATIONS = {
    "北京": 116.4, "上海": 121.4, "广州": 113.3, "香港": 114.1, "台北": 121.5,
    "天津": 117.2, "重庆": 106.5, "深圳": 114.1, "杭州": 120.2, "西安": 108.9,
    "成都": 104.1, "武汉": 114.3, "南京": 118.8, "长沙": 112.9, "青岛": 120.3,
    "大连": 121.6, "厦门": 118.1, "苏州": 120.6, "郑州": 113.7, "沈阳": 123.4,
    "昆明": 102.7, "南宁": 108.4, "哈尔滨": 126.6, "乌鲁木齐": 87.6,
    "拉萨": 91.1, "海口": 110.3, "兰州": 103.8, "贵阳": 106.6, "福州": 119.3,
    "南昌": 115.9, "合肥": 117.3, "济南": 117.0, "太原": 112.5, "石家庄": 114.5,
    "呼和浩特": 111.8, "银川": 106.3, "西宁": 101.8, "澳门": 113.5,
    "台南": 120.2, "高雄": 120.3,
    "Tokyo": 139.7, "Seoul": 127.0, "Singapore": 103.8, "NewYork": -74.0,
    "London": -0.1, "Paris": 2.4, "Sydney": 151.2, "LosAngeles": -118.2,
    "SanFrancisco": -122.4,
}


class ApiError(Exception):
    def __init__(self, status, code, message):
        super().__init__(message)
        self.status = status
        self.code = code


def send_json(res, status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    res.send_response(status)
    res.send_header("Content-Type", "application/json; charset=utf-8")
    res.send_header("Cache-Control", "no-store")
    res.send_header("X-Content-Type-Options", "nosniff")
    res.send_header("Content-Length", str(len(body)))
    res.end_headers()
    res.wfile.write(body)


def parse_body(req):
    length = int(req.headers.get("content-length") or 0)
    if length > MAX_BODY_BYTES:
        raise ApiError(413, "body_too_large", "请求内容过大")
    if length <= 0:
        return {}

    raw = req.rfile.read(length)
    try:
        return json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError:
        raise ApiError(400, "invalid_json", "请求 JSON 格式无效")


def parse_birthdate(value):
    text = str(value or "").strip().replace("T", " ")
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M"):
        try:
            parsed = datetime.strptime(text, fmt)
            if parsed.year < 1900 or parsed.year > 2100:
                raise ApiError(400, "invalid_birthdate", "出生年份需在 1900-2100 之间")
            return parsed
        except ValueError:
            continue
    raise ApiError(400, "invalid_birthdate", "出生时间格式应为 YYYY-MM-DD HH:MM")


def parse_sex(value):
    if value in (0, "0", "female", "女", "坤", "坤造"):
        return 0
    if value in (1, "1", "male", "男", "乾", "乾造", None):
        return 1
    raise ApiError(400, "invalid_sex", "性别参数无效")


def resolve_birthplace(value):
    text = str(value or "").strip()
    if not text:
        return {
            "name": "东八区标准经度",
            "longitude": 120.0,
            "source": "default",
        }

    try:
        longitude = float(text)
        if longitude < -180 or longitude > 180:
            raise ValueError
        return {
            "name": f"{longitude:g}°",
            "longitude": longitude,
            "source": "longitude",
        }
    except ValueError:
        pass

    if text in KNOWN_LOCATIONS:
        return {
            "name": text,
            "longitude": KNOWN_LOCATIONS[text],
            "source": "city",
        }

    raise ApiError(400, "unknown_birthplace", "暂未识别出生地，请填写城市名或经度")


def analyze_bazi(payload):
    dt = parse_birthdate(payload.get("birthdate"))
    sex = parse_sex(payload.get("sex"))
    place = resolve_birthplace(payload.get("birthplace"))
    true_dt = get_true_solar_time(dt, place["longitude"]).replace(tzinfo=None)
    lunar = get_lunar(true_dt)
    bazi = BaziEngine(true_dt, sex).analyze()

    return {
        "provider": "metaphysics-steward",
        "mode": "bazi",
        "attribution": "Based on superzhang21/metaphysics-steward (MIT), vendored for YiJie.",
        "config": {
            "inputTime": dt.strftime("%Y-%m-%d %H:%M"),
            "trueSolarTime": true_dt.strftime("%Y-%m-%d %H:%M"),
            "birthplace": place,
            "sex": "男" if sex == 1 else "女",
            "lunarDate": lunar.toString(),
        },
        "bazi": bazi,
    }


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Allow", "POST, OPTIONS")
        self.end_headers()

    def do_POST(self):
        try:
            payload = parse_body(self)
            mode = payload.get("mode", "bazi")
            if mode != "bazi":
                raise ApiError(400, "unsupported_mode", "当前校时排盘先支持八字")
            send_json(self, 200, analyze_bazi(payload))
        except ApiError as error:
            send_json(self, error.status, {
                "error": {
                    "code": error.code,
                    "message": str(error),
                },
            })
        except Exception as error:
            print("[metaphysics]", repr(error), file=sys.stderr)
            send_json(self, 502, {
                "error": {
                    "code": "metaphysics_error",
                    "message": "校时排盘暂时不可用，请稍后再试",
                },
            })

    def do_GET(self):
        send_json(self, 200, {
            "modes": ["bazi"],
            "message": "请在页面中提交出生时间、性别和出生地后查看结果。",
        })
