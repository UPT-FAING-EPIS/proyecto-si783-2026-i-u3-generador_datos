import os
import json
import asyncio
from dotenv import load_dotenv

from mcp.server.fastmcp import FastMCP
from skill_generador_datos.core import DataGenerator
from skill_generador_datos.schemas import DatabaseSchema, TableSchema, ColumnSchema, TableGenerationConfig

# Inicializar FastMCP Server
mcp = FastMCP("Generador de Datos Sintéticos")

@mcp.tool()
def generate_synthetic_data(
    schema_json: str, 
    tables_config_json: str, 
    ai_prompt: str = ""
) -> str:
    """
    Genera datos sintéticos para una base de datos respetando restricciones y llaves foráneas.
    
    Args:
        schema_json: Representación en JSON del DatabaseSchema (motor, database_name, tables...).
        tables_config_json: JSON string de una lista de TableGenerationConfig ([{table_name, record_count, selected}]).
        ai_prompt: (Opcional) Contexto global de negocio para la Inteligencia Artificial.
        
    Returns:
        Un string JSON con los datos generados para las tablas solicitadas.
    """
    try:
        # Cargar variables de entorno (p.ej. GEMINI_API_KEY)
        load_dotenv()
        
        # Parse inputs
        schema_dict = json.loads(schema_json)
        configs_list = json.loads(tables_config_json)
        
        # Build Schema Object
        tables = []
        for t in schema_dict.get("tables", []):
            columns = []
            for c in t.get("columns", []):
                # Clean parse combining camelCase and snake_case, ignoring missing keys so Pydantic uses defaults
                col_data = {
                    "name": c.get("name", c.get("column_name", "unknown")),
                    "data_type": c.get("dataType", c.get("data_type", "varchar")),
                }
                
                for camel, snake in [
                    ("isNullable", "is_nullable"),
                    ("isPrimaryKey", "is_primary_key"),
                    ("isUnique", "is_unique"),
                    ("defaultValue", "default_value"),
                    ("foreignKey", "foreign_key"),
                    ("maxLength", "max_length"),
                    ("maxId", "max_id"),
                    ("enumValues", "enum_values")
                ]:
                    if camel in c:
                        col_data[snake] = c[camel]
                    elif snake in c:
                        col_data[snake] = c[snake]

                columns.append(ColumnSchema(**col_data))
            tables.append(TableSchema(
                name=t["name"],
                columns=columns,
                primary_keys=t.get("primaryKeys", []),
                foreign_keys=t.get("foreignKeys", [])
            ))
            
        schema = DatabaseSchema(
            database_name=schema_dict.get("databaseName", "db"),
            motor=schema_dict.get("motor", "postgres"),
            tables=tables
        )
        
        # Build Configs Objects
        configs = []
        for cfg in configs_list:
            cfg_data = {
                "table_name": cfg.get("table_name", cfg.get("tableName", "unknown")),
            }
            if "record_count" in cfg: cfg_data["record_count"] = cfg["record_count"]
            elif "recordCount" in cfg: cfg_data["record_count"] = cfg["recordCount"]
            
            if "selected" in cfg: cfg_data["selected"] = cfg["selected"]
            
            configs.append(TableGenerationConfig(**cfg_data))
        
        # Ejecutar generación
        generator = DataGenerator(locale="es_ES")
        result = generator.generate(schema=schema, table_configs=configs, ai_prompt=ai_prompt)
        
        return json.dumps(result, ensure_ascii=False)
        
    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    # Iniciar el servidor MCP por stdio (Standard Input/Output)
    mcp.run()
