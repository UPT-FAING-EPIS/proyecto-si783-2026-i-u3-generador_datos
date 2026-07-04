import json
from sqlalchemy import create_engine, inspect, text
from skill_generador_datos import DataGenerator
from skill_generador_datos.schemas import DatabaseSchema, TableSchema, ColumnSchema, TableGenerationConfig

# 1. Configuración de conexión (con PyMySQL)
DB_URI = "mysql+pymysql://root:ramos_libra12@161.132.68.76:3306/eva_db"

print("1. Conectando a la base de datos real (eva_db)...")
engine = create_engine(DB_URI)

# 2. Leer la estructura real de la base de datos
inspector = inspect(engine)
tablas_db = []

print("2. Leyendo la estructura (tablas y columnas) de MySQL...")
table_names = inspector.get_table_names()

for table_name in table_names:
    columns_info = inspector.get_columns(table_name)
    pk_constraint = inspector.get_pk_constraint(table_name)
    pk_columns = pk_constraint.get('constrained_columns', [])
    
    fk_constraints = inspector.get_foreign_keys(table_name)
    
    columnas_schema = []
    for col in columns_info:
        # Detectar llaves foráneas
        fk_info = None
        for fk in fk_constraints:
            if col['name'] in fk['constrained_columns']:
                fk_info = {
                    "table": fk['referred_table'],
                    "column": fk['referred_columns'][0]
                }
                break
                
        # Traducir tipo de dato a string para la Skill
        tipo_str = str(col['type'])
        
        columnas_schema.append(
            ColumnSchema(
                name=col['name'],
                data_type=tipo_str,
                is_primary_key=(col['name'] in pk_columns),
                is_nullable=col['nullable'],
                foreign_key=fk_info
            )
        )
        
    tablas_db.append(TableSchema(name=table_name, columns=columnas_schema))

esquema = DatabaseSchema(database_name="eva_db", motor="mysql", tables=tablas_db)

# 3. Configurar cuántos datos generar por tabla (Ej: 3 por tabla para probar)
configs = []
for t in table_names:
    configs.append(TableGenerationConfig(table_name=t, record_count=3, selected=True))

print("3. Generando datos sintéticos inteligentes (usando la Skill)...")
generador = DataGenerator(locale="es_ES")
datos_generados = generador.generate(schema=esquema, table_configs=configs)

print("4. Inyectando datos en la base de datos...")
with engine.connect() as conn:
    # Deshabilitar comprobación de llaves foráneas temporalmente para insertar todo fácil
    conn.execute(text("SET FOREIGN_KEY_CHECKS=0;"))
    
    for tabla, info in datos_generados.items():
        filas = info["rows"]
        if not filas:
            continue
            
        print(f"   -> Insertando {len(filas)} filas en '{tabla}'...")
        columnas = info["columns"]
        
        # Crear query parametrizado seguro
        nombres_cols = ", ".join([f"`{c}`" for c in columnas])
        placeholders = ", ".join([f":{c}" for c in columnas])
        query = text(f"INSERT IGNORE INTO `{tabla}` ({nombres_cols}) VALUES ({placeholders})")
        
        # Ejecutar lote de inserciones
        for fila in filas:
            # Crear diccionario {columna: valor}
            parametros = {}
            for col_nombre, val in zip(columnas, fila):
                # Parche rápido: si la columna es 'data' o 'metadata' o JSON, MySQL requiere JSON válido
                if col_nombre in ['data', 'metadata', 'json_data', 'config']:
                    if isinstance(val, str) and not (val.startswith('{') or val.startswith('[')):
                        val = '{"test": "val"}' # JSON Dummy válido
                parametros[col_nombre] = val
                
            conn.execute(query, parametros)
            
    conn.execute(text("SET FOREIGN_KEY_CHECKS=1;"))
    conn.commit()

print("\n--- EXITO! Los datos han sido inyectados directamente en tu base de datos (eva_db). ---")
print("Revisa tu base de datos para ver los resultados.")
