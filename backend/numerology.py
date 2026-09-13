"""Pythagorean digit-sum convention; symbolic meanings, not predictions."""
import unicodedata
from datetime import date

THEMES = {
 1: ("Initiative", "Take the first small step on an idea you care about."),
 2: ("Cooperation", "Make room for a conversation in which both people feel heard."),
 3: ("Expression", "Give a creative idea a little time and a visible form."),
 4: ("Steadiness", "Choose one useful routine you can sustain without strain."),
 5: ("Exploration", "Try a manageable experiment and notice what you learn."),
 6: ("Care", "Offer support while leaving room for your own needs."),
 7: ("Reflection", "Protect a quiet hour for learning or thoughtful reflection."),
 8: ("Stewardship", "Turn an ambition into one practical, measurable next step."),
 9: ("Compassion", "Put your experience to use in a small act of generosity."),
 11: ("Inspiration", "Give an intuitive idea a practical test before acting on it."),
 22: ("Building", "Break a big vision into a small plan you can begin today."),
 33: ("Service", "Share what you know without taking responsibility for everyone."),
}

def reduce_number(total, masters=True):
    steps = [total]
    while total > 9 and not (masters and total in (11, 22, 33)):
        total = sum(map(int, str(total)))
        steps.append(total)
    return {"value": total, "sum": steps[0], "steps": steps,
            "theme": THEMES.get(total, ("Unavailable", ""))[0],
            "practice": THEMES.get(total, ("", ""))[1]}

def calculate(name, birth_date, today=None):
    born = date.fromisoformat(str(birth_date))
    today = today or date.today()
    normalized = ''.join(c for c in unicodedata.normalize('NFKD', name) if not unicodedata.combining(c)).upper()
    supported = all('A' <= c <= 'Z' or c in " -.'" for c in normalized)
    letters = [{"letter": c, "value": (ord(c) - 65) % 9 + 1, "vowel": c in 'AEIOU'}
               for c in normalized if 'A' <= c <= 'Z'] if supported else []
    year = reduce_number(sum(map(int, f'{born.month}{born.day}{today.year}')), False)
    month = reduce_number(year['value'] + today.month, False)
    life = reduce_number(sum(int(c) for c in born.isoformat() if c.isdigit()))
    destiny = reduce_number(sum(v['value'] for v in letters)) if letters else None
    vowels = [v for v in letters if v['vowel']]
    consonants = [v for v in letters if not v['vowel']]
    return {"system": "Pythagorean", "convention": "Sum all birth-date digits; preserve final master numbers 11, 22, 33. A=1 through I=9, repeating; Y is a consonant. Calendar-year personal cycles reduce to 1–9.",
            "name": name, "letters": letters, "life_path": life, "destiny": destiny,
            "soul_urge": reduce_number(sum(v['value'] for v in vowels)) if vowels else None,
            "personality": reduce_number(sum(v['value'] for v in consonants)) if consonants else None,
            "birthday": reduce_number(born.day), "personal_year": year,
            "personal_month": month, "personal_day": reduce_number(month['value'] + today.day, False),
            "maturity": reduce_number(life['value'] + destiny['value']) if destiny else None,
            "as_of": today.isoformat(),
            "notice": "Numerology offers traditional symbolic interpretations, not verified predictions.",
            "name_notice": None if letters else "Use a Latin-letter name spelling to calculate name numbers; no spelling is guessed."}
