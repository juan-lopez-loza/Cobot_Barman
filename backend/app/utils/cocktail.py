from app.utils.load_json import open_data
from fastapi import HTTPException
from typing import Optional
import json

def edit_cocktail_value(
    cocktail_id: int,
    cocktail_name: Optional[str] = None,
    cocktail_move1: Optional[str] = None,
    cocktail_move2: Optional[str] = None,
):
    database = open_data()
    cocktails = database[0]["drinks"]

    for cocktail in cocktails:
        if cocktail_id == cocktail["id"]:
            if cocktail_name is not None:
                cocktail["name"] = cocktail_name

            for position in cocktail["positions"]:
                if position["label"] == "DS" and cocktail_move1 is not None:
                    position["value"] = cocktail_move1
                elif position["label"] == "US" and cocktail_move2 is not None:
                    position["value"] = cocktail_move2

            with open('./database/test.json', 'w') as f:
                json.dump(database, f, indent=2)

            return {"message": "Cocktail updated successfully"}

    raise HTTPException(status_code=404, detail="Cocktail not found")