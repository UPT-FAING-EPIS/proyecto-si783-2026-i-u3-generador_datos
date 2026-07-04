from skill_generador_datos import DataGenerator
from skill_generador_datos.schemas import DatabaseSchema, TableSchema, ColumnSchema, TableGenerationConfig

print("1. Inicializando la Skill...")
generador = DataGenerator(locale="es_ES")

print("2. Configurando una base de datos de prueba...")
tabla = TableSchema(name="usuarios", columns=[
    ColumnSchema(name="id", data_type="int", is_primary_key=True),
    ColumnSchema(name="nombre", data_type="varchar", max_length=50),
    ColumnSchema(name="email", data_type="varchar"),
    ColumnSchema(name="rol", data_type="varchar")
])
esquema = DatabaseSchema(database_name="TestDB", motor="postgres", tables=[tabla])

config = [TableGenerationConfig(table_name="usuarios", record_count=5, selected=True)]

print("3. Generando datos (usará IA si hay llave, sino usará Faker)...")
datos = generador.generate(schema=esquema, table_configs=config)

print("4. Escribiendo los datos en un archivo 'datos.sql'...")
with open("datos.sql", "w", encoding="utf-8") as f:
    for tabla_nombre, info in datos.items():
        columnas = ", ".join(info["columns"])
        for fila in info["rows"]:
            # Convertir valores a formato SQL (textos con comillas simples)
            valores_sql = []
            for val in fila:
                if isinstance(val, str):
                    valores_sql.append(f"'{val}'")
                elif val is None:
                    valores_sql.append("NULL")
                else:
                    valores_sql.append(str(val))
            
            valores_str = ", ".join(valores_sql)
            f.write(f"INSERT INTO {tabla_nombre} ({columnas}) VALUES ({valores_str});\n")

print("\n--- ¡ARCHIVO 'datos.sql' CREADO CON ÉXITO! ---\n")
