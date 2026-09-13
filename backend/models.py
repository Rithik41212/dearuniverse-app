from datetime import date, time
from typing import Literal
from pydantic import BaseModel, Field, model_validator

class BirthInput(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    gender: Literal['female', 'male', 'unspecified'] = 'unspecified'
    birth_date: date
    birth_time: time | None = None
    time_accuracy: Literal["exact", "approximate", "unknown"] = "exact"
    uncertainty_minutes: int = Field(default=30, ge=1, le=720)
    place_id: str = Field(min_length=1, max_length=100)
    fold: Literal[0, 1] | None = None
    preferred_system: Literal["western", "vedic"] = "vedic"

    @model_validator(mode="after")
    def validate_birth(self):
        if not 1900 <= self.birth_date.year <= date.today().year or self.birth_date > date.today():
            raise ValueError("Supported birth dates are 1900 through today.")
        if self.time_accuracy != "unknown" and self.birth_time is None:
            raise ValueError("Enter a birth time or choose 'I don't know'.")
        if self.birth_time and self.birth_time.tzinfo:
            raise ValueError("Birth time must be the local clock time without an offset.")
        self.name = self.name.strip()
        if not self.name:
            raise ValueError("Enter a name for this profile.")
        return self

class MatchInput(BaseModel):
    profile_a: str
    profile_b: str
    # Traditional directional rules use these two roles; no gender is inferred.
    orientation: Literal["a_to_b", "b_to_a"] = "a_to_b"

class GroupInput(BaseModel):
    profile_ids: list[str] = Field(min_length=2, max_length=8)
