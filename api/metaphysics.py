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

CITY_LOCATIONS = {
    "北京": 116.4, "上海": 121.4, "广州": 113.3, "香港": 114.1, "台北": 121.5,
    "天津": 117.2, "重庆": 106.5, "深圳": 114.1, "杭州": 120.2, "西安": 108.9,
    "成都": 104.1, "武汉": 114.3, "南京": 118.8, "长沙": 112.9, "青岛": 120.3,
    "大连": 121.6, "厦门": 118.1, "苏州": 120.6, "郑州": 113.7, "沈阳": 123.4,
    "昆明": 102.7, "南宁": 108.4, "哈尔滨": 126.6, "乌鲁木齐": 87.6,
    "拉萨": 91.1, "海口": 110.3, "兰州": 103.8, "贵阳": 106.6, "福州": 119.3,
    "南昌": 115.9, "合肥": 117.3, "济南": 117.0, "太原": 112.5, "石家庄": 114.5,
    "呼和浩特": 111.8, "银川": 106.3, "西宁": 101.8, "澳门": 113.5,
    "台南": 120.2, "高雄": 120.3, "长春": 125.3, "南阳": 112.5, "洛阳": 112.5,
    "开封": 114.3, "襄阳": 112.1, "宜昌": 111.3, "岳阳": 113.1, "衡阳": 112.6,
    "株洲": 113.1, "湘潭": 112.9, "常德": 111.7, "郴州": 113.0, "宁波": 121.5,
    "温州": 120.7, "无锡": 120.3, "常州": 119.9, "南通": 120.9, "徐州": 117.2,
    "扬州": 119.4, "佛山": 113.1, "东莞": 113.8, "珠海": 113.6, "中山": 113.4,
    "惠州": 114.4, "汕头": 116.7, "泉州": 118.7, "嘉兴": 120.8, "绍兴": 120.6,
    "金华": 119.6, "烟台": 121.4, "潍坊": 119.2, "临沂": 118.4, "唐山": 118.2,
    "保定": 115.5, "邯郸": 114.5, "秦皇岛": 119.6, "齐齐哈尔": 123.9,
    "牡丹江": 129.6, "包头": 109.8, "鄂尔多斯": 109.8, "桂林": 110.3,
    "柳州": 109.4, "北海": 109.1, "三亚": 109.5, "绵阳": 104.7, "德阳": 104.4,
    "乐山": 103.8, "泸州": 105.4, "宜宾": 104.6, "遵义": 106.9, "大理": 100.2,
    "丽江": 100.2, "曲靖": 103.8, "宝鸡": 107.1, "榆林": 109.7, "天水": 105.7,
    "喀什": 75.99, "库尔勒": 86.1, "伊宁": 81.3, "日喀则": 88.9,
    "Tokyo": 139.7, "Seoul": 127.0, "Singapore": 103.8, "NewYork": -74.0,
    "London": -0.1, "Paris": 2.4, "Sydney": 151.2, "LosAngeles": -118.2,
    "SanFrancisco": -122.4,
}

REGION_LOCATIONS = {
    "河北": 114.5, "山西": 112.5, "辽宁": 123.4, "吉林": 125.3,
    "黑龙江": 126.6, "江苏": 118.8, "浙江": 120.2, "安徽": 117.3,
    "福建": 119.3, "江西": 115.9, "山东": 117.0, "河南": 113.7,
    "湖北": 114.3, "湖南": 112.9, "广东": 113.3, "海南": 110.3,
    "四川": 104.1, "贵州": 106.6, "云南": 102.7, "陕西": 108.9,
    "甘肃": 103.8, "青海": 101.8, "台湾": 121.5, "内蒙古": 111.8,
    "广西": 108.4, "西藏": 91.1, "宁夏": 106.3, "新疆": 87.6,
}

LOCATION_ALIASES = {
    "广西壮族自治区": "广西",
    "宁夏回族自治区": "宁夏",
    "新疆维吾尔自治区": "新疆",
    "西藏自治区": "西藏",
    "内蒙古自治区": "内蒙古",
    "香港特别行政区": "香港",
    "澳门特别行政区": "澳门",
}

LOCATION_SUFFIXES = ("特别行政区", "壮族自治区", "回族自治区", "维吾尔自治区", "自治区", "省", "市")


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


def strip_location_suffix(text):
    for suffix in LOCATION_SUFFIXES:
        if text.endswith(suffix):
            return text[: -len(suffix)]
    return text


def location_candidates(text):
    compact = "".join(str(text or "").strip().split())
    candidates = []

    def add(value):
        if value and value not in candidates:
            candidates.append(value)

    add(compact)
    add(LOCATION_ALIASES.get(compact))
    stripped = strip_location_suffix(compact)
    add(stripped)
    add(LOCATION_ALIASES.get(stripped))

    for city in sorted(CITY_LOCATIONS, key=len, reverse=True):
        if city in compact:
            add(city)

    for region in sorted(REGION_LOCATIONS, key=len, reverse=True):
        if region in compact:
            add(region)

    return candidates


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

    for candidate in location_candidates(text):
        if candidate in CITY_LOCATIONS:
            return {
                "name": candidate,
                "longitude": CITY_LOCATIONS[candidate],
                "source": "city",
            }
        if candidate in REGION_LOCATIONS:
            return {
                "name": candidate,
                "longitude": REGION_LOCATIONS[candidate],
                "source": "region",
            }

    raise ApiError(400, "unknown_birthplace", "暂未识别出生地，请填写省份、城市名或经度")


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
