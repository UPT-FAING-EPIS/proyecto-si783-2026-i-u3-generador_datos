from pytest_bdd import scenario, given, when, then, parsers
from backend.generators.data_generator import DataGenerator
from backend.models.schemas import DatabaseSchema, TableSchema, ColumnSchema, TableGenerationConfig

@scenario('features/generacion_datos.feature', 'Generar 5 registros para una tabla básica')
def test_generacion_basica():
    pass

@given(parsers.parse('que tengo una configuración de tabla llamada "{table_name}"'), target_fixture="context")
def step_given_config(table_name):
    # Simular un esquema
    col_id = ColumnSchema(name="id", data_type="int", is_primary_key=True)
    col_name = ColumnSchema(name="nombre", data_type="varchar")
    tabla = TableSchema(name=table_name, columns=[col_id, col_name])
    esquema = DatabaseSchema(motor="postgres", database_name="test_db", tables=[tabla])
    
    return {"esquema": esquema, "table_name": table_name, "configs": []}

@given(parsers.parse('quiero generar {count:d} registros'))
def step_given_count(context, count):
    config = TableGenerationConfig(table_name=context["table_name"], record_count=count)
    context["configs"].append(config)

@when('ejecuto el motor de generación')
def step_when_execute(context):
    generador = DataGenerator()
    resultado = generador.generate(schema=context["esquema"], table_configs=context["configs"])
    context["resultado"] = resultado

@then(parsers.parse('el resultado debe contener la clave "{key}"'))
def step_then_contains_key(context, key):
    assert key in context["resultado"]

@then(parsers.parse('la lista de filas de "{table_name}" debe tener exactamente {count:d} elementos'))
def step_then_row_count(context, table_name, count):
    filas = context["resultado"][table_name]["rows"]
    assert len(filas) == count
