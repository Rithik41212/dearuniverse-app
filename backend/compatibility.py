"""Western synastry and a named, unadjusted North Indian Ashtakoota convention.

Traditional lookup values checked against PyJHora's published North Indian tables.
See README for sources and the intentionally excluded cancellation rules.
"""
from .ephemeris import aspects
from .vedic import nakshatra, kundali

YONI_BY_STAR = [0,1,2,3,3,4,5,2,5,6,6,7,8,9,8,9,10,10,4,11,12,11,13,0,13,7,1]
YONI = [[int(n) for n in row] for row in [
 "42232221011321", "24332222312320", "23421213312031", "33242111122202",
 "22124212210211", "22212402213321", "22111042222212", "12312224303221",
 "03312223412221", "11121120141121", "12220323214221", "33022322212432",
 "22301212222342", "10121121111224"]]
VASHYA = [[2,.5,1,0,2],[.5,2,0,0,0],[1,0,2,2,2],[0,0,2,2,0],[1,0,1,0,2]]
GANA = [[6,6,0],[5,6,0],[1,0,6]]
RULERS = [2,5,3,1,0,3,5,2,4,6,6,4]
MAITRI = [[5,5,5,4,5,0,0],[5,5,4,1,4,.5,.5],[5,4,5,.5,5,3,.5],
          [4,1,.5,5,.5,5,4],[5,4,5,.5,5,.5,3],[0,.5,3,5,.5,5,5],[0,.5,.5,4,3,5,5]]

def gana(star):
    return 0 if star in [0,4,6,7,12,14,16,21,26] else 1 if star in [1,3,5,10,11,19,20,24,25] else 2

def vashya(lon):
    sign, degree = int(lon / 30), lon % 30
    if sign in [0,1] or (sign == 8 and degree >= 15) or (sign == 9 and degree < 15):
        return 0
    if sign in [2,5,6,10] or (sign == 8 and degree < 15):
        return 1
    if sign in [3,11] or sign == 9:
        return 2
    return 3 if sign == 4 else 4

def ashtakoota(a, b):
    if not (a["time_known"] and b["time_known"]):
        return {"available": False, "total": None, "factors": [],
                "reason": "Both exact birth times are needed for the full matching score."}
    la, lb = a["planets"]["Moon"]["longitude"], b["planets"]["Moon"]["longitude"]
    na, nb = nakshatra(la)["index"], nakshatra(lb)["index"]
    sa, sb = int(la / 30), int(lb / 30)
    # Traditional directional A/B slots; A corresponds to the groom column.
    varna_rank = [3,2,1,4]
    tara = sum(1.5 for x,y in [(na,nb),(nb,na)] if ((y-x) % 27 + 1) % 9 not in [3,5,7])
    nadi = [0,1,2,2,1,0]
    distance = (sb - sa) % 12 + 1
    rows = [("Varna", int(varna_rank[sa % 4] >= varna_rank[sb % 4]), 1),
            ("Vashya", VASHYA[vashya(lb)][vashya(la)], 2), ("Tara", tara, 3),
            ("Yoni", YONI[YONI_BY_STAR[nb]][YONI_BY_STAR[na]], 4),
            ("Graha Maitri", MAITRI[RULERS[sb]][RULERS[sa]], 5),
            ("Gana", GANA[gana(nb)][gana(na)], 6),
            ("Bhakoot", 0 if distance in [2,5,6,8,9,12] else 7, 7),
            ("Nadi", 0 if nadi[na % 6] == nadi[nb % 6] else 8, 8)]
    return {"available": True, "total": sum(r[1] for r in rows), "maximum": 36,
            "factors": [{"name": n, "score": s, "maximum": m} for n,s,m in rows],
            "convention": "North Indian base Ashtakoota v1; directional A/B; no cancellation or regional exceptions",
            "meaning": "Traditional matching points, not a probability of relationship success or a health assessment."}

def compare(a, b, orientation="a_to_b"):
    if orientation == "b_to_a":
        a, b = b, a
    ca, cb = a["charts"]["western"], b["charts"]["western"]
    links = aspects(ca["planets"], cb["planets"])
    return {"profile_a": a["id"], "profile_b": b["id"], "names": [a["birth"]["name"], b["birth"]["name"]],
            "western": {"available": ca["time_known"] and cb["time_known"], "aspects": links,
                        "reason": None if ca["time_known"] and cb["time_known"] else "Exact birth times are required for exact synastry aspects."},
            "vedic": ashtakoota(a["charts"]["vedic"], b["charts"]["vedic"]),
            "kundali_a": kundali(a["charts"]["vedic"]), "kundali_b": kundali(b["charts"]["vedic"])}
