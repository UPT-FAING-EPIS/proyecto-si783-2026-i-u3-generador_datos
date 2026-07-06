Feature: Generación de datos sintéticos
  Como desarrollador
  Quiero poder generar datos sintéticos a partir de un esquema
  Para realizar pruebas en mi base de datos de desarrollo

  Scenario: Generar 5 registros para una tabla básica
    Given que tengo una configuración de tabla llamada "usuarios"
    And quiero generar 5 registros
    When ejecuto el motor de generación
    Then el resultado debe contener la clave "usuarios"
    And la lista de filas de "usuarios" debe tener exactamente 5 elementos
