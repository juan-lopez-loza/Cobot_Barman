import json
from fastapi import HTTPException
from app.utils.load_json import open_data

database = open_data()

def find_glasses():
    database = open_data()
    glasses = database[1]["glasses"]
    for glass in glasses:
        if glass['state']:
            return glass
    raise HTTPException(status_code=404, detail="No glasses available")

def change_glass_state(glass: list):
    for g in database[1]["glasses"]:
        if g['label'] == glass['label']:
            g['state'] = False
            break

    with open("./database/test.json", "w") as f:
        json.dump(database, f, indent=2)

def glasses_state(glasses_id: int, glasses_state: bool):
    glasses = database[1]["glasses"]
    for glass in glasses:
        if glasses_id == glass["id"]:
            glass["state"] = glasses_state
            with open('./database/test.json', 'w') as f:
                json.dump(database, f, indent=2)
            return {"message": "Glass state changed with success"}
    raise HTTPException(status_code=404, detail="Glass not found")