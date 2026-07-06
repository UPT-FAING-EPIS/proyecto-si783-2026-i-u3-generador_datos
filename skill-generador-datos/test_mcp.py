import json
from skill_generador_datos.mcp_server import generate_synthetic_data

schema_json = json.dumps({
    "databaseName": "test_db",
    "motor": "postgres",
    "tables": [
        {
            "name": "estudiantes",
            "columns": [
                {"name": "id", "dataType": "int", "isPrimaryKey": True},
                {"name": "nombre", "dataType": "varchar"},
                {"name": "correo", "dataType": "varchar", "isUnique": True},
                {"name": "promedio_notas", "dataType": "decimal"}
            ]
        }
    ]
})

config_json = json.dumps([
    {"tableName": "estudiantes", "recordCount": 5}
])

print("Testing generate_synthetic_data...")
res = generate_synthetic_data(schema_json, config_json, "")
print(res)
