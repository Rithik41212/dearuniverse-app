"""Versioned, non-predictive reference data for the Vedic rule engine.

The deity, symbol and shakti labels are adapted from the MIT-licensed Graha
project at commit fd5b9dbbc852cffb907451d6d7c952b51152ca78. See
backend/THIRD_PARTY_NOTICES.md. They are metadata, not calculated facts or
claims about a person's life.
"""

NAKSHATRA_METADATA = [
    {"name": "Ashwini", "deity": "Ashwini Kumaras", "symbol": "Horse's head", "shakti": "Healing and swift action"},
    {"name": "Bharani", "deity": "Yama", "symbol": "Yoni", "shakti": "Carrying away and purification"},
    {"name": "Krittika", "deity": "Agni", "symbol": "Razor or flame", "shakti": "Purification and cutting through"},
    {"name": "Rohini", "deity": "Prajapati", "symbol": "Chariot or cart", "shakti": "Growth and creation"},
    {"name": "Mrigashira", "deity": "Soma", "symbol": "Deer's head", "shakti": "Seeking and exploration"},
    {"name": "Ardra", "deity": "Rudra", "symbol": "Teardrop or diamond", "shakti": "Effort and transformation"},
    {"name": "Punarvasu", "deity": "Aditi", "symbol": "Quiver of arrows", "shakti": "Renewal and return"},
    {"name": "Pushya", "deity": "Brihaspati", "symbol": "Cow's udder or flower", "shakti": "Nourishment and strengthening"},
    {"name": "Ashlesha", "deity": "Nagas", "symbol": "Coiled serpent", "shakti": "Binding and entwining"},
    {"name": "Magha", "deity": "Pitris", "symbol": "Royal throne", "shakti": "Continuity of lineage"},
    {"name": "Purva Phalguni", "deity": "Bhaga", "symbol": "Front legs of a bed", "shakti": "Creation and enjoyment"},
    {"name": "Uttara Phalguni", "deity": "Aryaman", "symbol": "Back legs of a bed", "shakti": "Patronage and partnership"},
    {"name": "Hasta", "deity": "Savitr", "symbol": "Hand or fist", "shakti": "Manifesting through skill"},
    {"name": "Chitra", "deity": "Tvashtar", "symbol": "Pearl or jewel", "shakti": "Crafting and creating form"},
    {"name": "Swati", "deity": "Vayu", "symbol": "Young plant in the wind", "shakti": "Independence and movement"},
    {"name": "Vishakha", "deity": "Indra and Agni", "symbol": "Gateway or potter's wheel", "shakti": "Achieving a chosen aim"},
    {"name": "Anuradha", "deity": "Mitra", "symbol": "Lotus or staff", "shakti": "Friendship and devotion"},
    {"name": "Jyeshtha", "deity": "Indra", "symbol": "Umbrella or earring", "shakti": "Protection and seniority"},
    {"name": "Mula", "deity": "Nirriti", "symbol": "Tied roots", "shakti": "Uprooting and reaching the root"},
    {"name": "Purva Ashadha", "deity": "Apas", "symbol": "Fan or elephant tusk", "shakti": "Invigoration and purification"},
    {"name": "Uttara Ashadha", "deity": "Vishvadevas", "symbol": "Elephant tusk", "shakti": "Enduring achievement"},
    {"name": "Shravana", "deity": "Vishnu", "symbol": "Ear", "shakti": "Listening and connection"},
    {"name": "Dhanishta", "deity": "Eight Vasus", "symbol": "Drum or flute", "shakti": "Abundance and renown"},
    {"name": "Shatabhisha", "deity": "Varuna", "symbol": "Empty circle", "shakti": "Healing and restoration"},
    {"name": "Purva Bhadrapada", "deity": "Aja Ekapada", "symbol": "Front legs of a funeral cot", "shakti": "Elevation through inner fire"},
    {"name": "Uttara Bhadrapada", "deity": "Ahir Budhnya", "symbol": "Back legs of a funeral cot", "shakti": "Stability and depth"},
    {"name": "Revati", "deity": "Pushan", "symbol": "Fish or drum", "shakti": "Nourishment and safe passage"},
]

assert len(NAKSHATRA_METADATA) == 27
assert len({entry["name"] for entry in NAKSHATRA_METADATA}) == 27

