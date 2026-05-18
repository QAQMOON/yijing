// 1900-01-01 to 2100-12-31 Gan-Zhi lookup (pre-computed)
// Based on: 1900-01-01 = 甲戌日 (index 10)
// Year pillar: simplified lookup for 1900-2100
const YEAR_GANZHI = {
  1900: '庚子', 1901: '辛丑', 1902: '壬寅', 1903: '癸卯', 1904: '甲辰',
  1905: '乙巳', 1906: '丙午', 1907: '丁未', 1908: '戊申', 1909: '己酉',
  1910: '庚戌', 1911: '辛亥', 1912: '壬子', 1913: '癸丑', 1914: '甲寅',
  1915: '乙卯', 1916: '丙辰', 1917: '丁巳', 1918: '戊午', 1919: '己未',
  1920: '庚申', 1921: '辛酉', 1922: '壬戌', 1923: '癸亥', 1924: '甲子',
  1925: '乙丑', 1926: '丙寅', 1927: '丁卯', 1928: '戊辰', 1929: '己巳',
  1930: '庚午', 1931: '辛未', 1932: '壬申', 1933: '癸酉', 1934: '甲戌',
  1935: '乙亥', 1936: '丙子', 1937: '丁丑', 1938: '戊寅', 1939: '己卯',
  1940: '庚辰', 1941: '辛巳', 1942: '壬午', 1943: '癸未', 1944: '甲申',
  1945: '乙酉', 1946: '丙戌', 1947: '丁亥', 1948: '戊子', 1949: '己丑',
  1950: '庚寅', 1951: '辛卯', 1952: '壬辰', 1953: '癸巳', 1954: '甲午',
  1955: '乙未', 1956: '丙申', 1957: '丁酉', 1958: '戊戌', 1959: '己亥',
  1960: '庚子', 1961: '辛丑', 1962: '壬寅', 1963: '癸卯', 1964: '甲辰',
  1965: '乙巳', 1966: '丙午', 1967: '丁未', 1968: '戊申', 1969: '己酉',
  1970: '庚戌', 1971: '辛亥', 1972: '壬子', 1973: '癸丑', 1974: '甲寅',
  1975: '乙卯', 1976: '丙辰', 1977: '丁巳', 1978: '戊午', 1979: '己未',
  1980: '庚申', 1981: '辛酉', 1982: '壬戌', 1983: '癸亥', 1984: '甲子',
  1985: '乙丑', 1986: '丙寅', 1987: '丁卯', 1988: '戊辰', 1989: '己巳',
  1990: '庚午', 1991: '辛未', 1992: '壬申', 1993: '癸酉', 1994: '甲戌',
  1995: '乙亥', 1996: '丙子', 1997: '丁丑', 1998: '戊寅', 1999: '己卯',
  2000: '庚辰', 2001: '辛巳', 2002: '壬午', 2003: '癸未', 2004: '甲申',
  2005: '乙酉', 2006: '丙戌', 2007: '丁亥', 2008: '戊子', 2009: '己丑',
  2010: '庚寅', 2011: '辛卯', 2012: '壬辰', 2013: '癸巳', 2014: '甲午',
  2015: '乙未', 2016: '丙申', 2017: '丁酉', 2018: '戊戌', 2019: '己亥',
  2020: '庚子', 2021: '辛丑', 2022: '壬寅', 2023: '癸卯', 2024: '甲辰',
  2025: '乙巳', 2026: '丙午', 2027: '丁未', 2028: '戊申', 2029: '己酉',
  2030: '庚戌', 2031: '辛亥', 2032: '壬子', 2033: '癸丑', 2034: '甲寅',
  2035: '乙卯', 2036: '丙辰', 2037: '丁巳', 2038: '戊午', 2039: '己未',
  2040: '庚申', 2041: '辛酉', 2042: '壬戌', 2043: '癸亥', 2044: '甲子',
  2045: '乙丑', 2046: '丙寅', 2047: '丁卯', 2048: '戊辰', 2049: '己巳',
  2050: '庚午', 2051: '辛未', 2052: '壬申', 2053: '癸酉', 2054: '甲戌',
  2055: '乙亥', 2056: '丙子', 2057: '丁丑', 2058: '戊寅', 2059: '己卯',
  2060: '庚辰', 2061: '辛巳', 2062: '壬午', 2063: '癸未', 2064: '甲申',
  2065: '乙酉', 2066: '丙戌', 2067: '丁亥', 2068: '戊子', 2069: '己丑',
  2070: '庚寅', 2071: '辛卯', 2072: '壬辰', 2073: '癸巳', 2074: '甲午',
  2075: '乙未', 2076: '丙申', 2077: '丁酉', 2078: '戊戌', 2079: '己亥',
  2080: '庚子', 2081: '辛丑', 2082: '壬寅', 2083: '癸卯', 2084: '甲辰',
  2085: '乙巳', 2086: '丙午', 2087: '丁未', 2088: '戊申', 2089: '己酉',
  2090: '庚戌', 2091: '辛亥', 2092: '壬子', 2093: '癸丑', 2094: '甲寅',
  2095: '乙卯', 2096: '丙辰', 2097: '丁巳', 2098: '戊午', 2099: '己未',
  2100: '庚申',
};

// Month stem from year stem: 五虎遁
const MONTH_STEM_START = { '甲':0,'己':0, '乙':2,'庚':2, '丙':4,'辛':4, '丁':6,'壬':6, '戊':8,'癸':8 };
const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// Hour stem from day stem: 五鼠遁
const HOUR_STEM_START = { '甲':0,'己':0, '乙':2,'庚':2, '丙':4,'辛':4, '丁':6,'壬':6, '戊':8,'癸':8 };

export function getYearPillar(year) {
  const gz = YEAR_GANZHI[year] || '庚申';
  return { stem: gz[0], branch: gz[1], full: gz };
}

export function getMonthPillar(yearStem, month) {
  const startStem = MONTH_STEM_START[yearStem] || 0;
  const stemIdx = (startStem + (month - 1)) % 10;
  const branchIdx = (month + 1) % 12;
  const full = STEMS[stemIdx] + BRANCHES[branchIdx];
  return { stem: STEMS[stemIdx], branch: BRANCHES[branchIdx], full };
}

export function getDayPillar(date) {
  const ref = new Date(1900, 0, 1);
  const days = Math.floor((date - ref) / (1000 * 60 * 60 * 24));
  const idx = ((days % 60) + 60) % 60;
  const stemIdx = idx % 10;
  const branchIdx = idx % 12;
  const full = STEMS[stemIdx] + BRANCHES[branchIdx];
  return { stem: STEMS[stemIdx], branch: BRANCHES[branchIdx], full };
}

export function getHourPillar(dayStem, hour) {
  const startStem = HOUR_STEM_START[dayStem] || 0;
  const branchIdx = Math.floor((hour + 1) / 2) % 12;
  const stemIdx = (startStem + branchIdx) % 10;
  const full = STEMS[stemIdx] + BRANCHES[branchIdx];
  return { stem: STEMS[stemIdx], branch: BRANCHES[branchIdx], full };
}

export function calculateBaZi(year, month, day, hour) {
  const date = new Date(year, month - 1, day);
  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(yearPillar.stem, month);
  const dayPillar = getDayPillar(date);
  const hourPillar = getHourPillar(dayPillar.stem, hour);

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  };
}
