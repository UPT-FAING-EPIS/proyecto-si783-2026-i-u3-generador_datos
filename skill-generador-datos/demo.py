import json
from skill_generador_datos.core import DataGenerator
from skill_generador_datos.schemas import DatabaseSchema, TableSchema, ColumnSchema, TableGenerationConfig

def correr_demo():
    print("Iniciando Skill Generador de Datos...")
    generator = DataGenerator(locale="es_ES")
    
    # 1. Definimos un esquema de base de datos de prueba
    user_table = TableSchema(
        name="usuarios",
        columns=[
            ColumnSchema(name="id", data_type="int", is_primary_key=True),
            ColumnSchema(name="nombre", data_type="varchar"),
            ColumnSchema(name="correo", data_type="varchar", is_unique=True)
        ]
    )
    
    post_table = TableSchema(
        name="publicaciones",
        columns=[
            ColumnSchema(name="id", data_type="int", is_primary_key=True),
            ColumnSchema(name="usuario_id", data_type="int", foreign_key={"table": "usuarios", "column": "id"}),
            ColumnSchema(name="contenido", data_type="text")
        ]
    )
    
    schema = DatabaseSchema(
        database_name="demo_db",
        motor="postgres",
        tables=[user_table, post_table]
    )

    # 2. Configuramos cuántos registros queremos
    configs = [
        TableGenerationConfig(table_name="usuarios", record_count=3),
        TableGenerationConfig(table_name="publicaciones", record_count=5)
    ]

    print("Generando datos simulados (resolviendo llaves foráneas)...\n")
    
    # 3. Ejecutamos la generación
    resultados = generator.generate(schema=schema, table_configs=configs)

    # 4. Imprimimos el resultado bonito
    print(json.dumps(resultados, indent=2, ensure_ascii=False))
    print("\nGeneracion completada con exito.")

if __name__ == '__main__':
    correr_demo()
