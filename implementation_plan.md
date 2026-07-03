# Implementación de Generación de Datos Híbrida con IA

El objetivo es mejorar la calidad de los datos generados reemplazando los valores genéricos (como Lorem Ipsum) por datos altamente contextualizados, utilizando el LLM Gemini. Para garantizar un alto rendimiento en la generación masiva (ej. 10,000 registros), se usará un **enfoque híbrido**:
1. **Fase de Semilla (Seed)**: Gemini genera un lote pequeño (ej. 50 registros) que sirve de base, con valores hiperrealistas adaptados al esquema y a un posible prompt del usuario.
2. **Fase de Multiplicación (Mutación)**: Un algoritmo local súper rápido toma esa "semilla" y genera los miles de registros restantes. Combina el uso de `Faker` (para datos genéricos) y permutación de la semilla de IA (para datos muy específicos).

## Resoluciones del Feedback

- **Modelo de IA**: Confirmado el uso de Google Gemini. (La API KEY proporcionada se configurará de forma segura en el `.env`).
- **Lógica del Prompt**: Se incluirá la opción de ingresar un prompt manual. Si no se ingresa nada, el sistema armará automáticamente un prompt estructurado enviando a la IA todos los detalles de la tabla (columnas, llaves foráneas, restricciones de unicidad, etc.) para que se guíe sola.
- **Lógica de Mutación**: Para multiplicar los datos, evaluaremos cada columna. Si la columna es algo que `Faker` hace bien (nombres, correos, direcciones), delegaremos la generación masiva a `Faker`. Si es una columna de dominio específico (generada inteligentemente por la IA), mezclaremos y permutaremos los valores de la "semilla" generada por Gemini para crear variedad sin perder el contexto.

---

## Proposed Changes

### 1. Variables de Entorno
Configurar las credenciales.
#### [MODIFY] `.env`
- Añadir la variable `GEMINI_API_KEY`.

### 2. Frontend (Interfaz de Usuario)
Se modificará la interfaz para permitir seleccionar la opción de generación por IA.
#### [MODIFY] `frontend/components/dashboard/DataGeneratorSection.tsx`
- Añadir un toggle/switch de "Mejorar con IA (Gemini)".
- Añadir un campo de texto opcional para `ai_prompt` por cada tabla o a nivel global.

### 3. Backend Schemas
Se actualizarán los esquemas para recibir la configuración de IA.
#### [MODIFY] `backend/models/schemas.py`
- En `TableGenerationConfig` añadir `use_ai: bool = False` y `ai_prompt: Optional[str] = None`.

### 4. Integración de IA
Módulo dedicado a interactuar con Gemini.
#### [NEW] `backend/generators/ai_generator.py`
- Función `generate_seed_data(table_schema, prompt, seed_size=50)`.
- **Lógica de Prompting**: Construirá un prompt dinámico indicando: *"Actúa como un generador de datos en formato JSON. Necesito 50 registros para la tabla X. Las columnas son [Detalles]. Debes respetar estas llaves foráneas [Detalles] y valores únicos. [Prompt de usuario si existe]"*.
- Retornará la respuesta de Gemini parseada como una matriz de Python.

### 5. Multiplicador Híbrido (Mixto)
Lógica para escalar los datos combinando Faker y la Semilla IA.
#### [NEW] `backend/generators/hybrid_multiplier.py`
- Función `multiply_data(seed_rows, target_count, table_schema, fake_instance)`.
- **Lógica de Columna**: 
  - Usar la función existente `get_faker_method_for_column` para detectar si hay un buen método genérico (ej. `email`, `first_name`).
  - Si Faker lo puede hacer: Generarlo con Faker en tiempo real (muy rápido).
  - Si Faker usaría un genérico (ej. solo devolver `word` o un número X): En su lugar, agarrar la piscina de valores de esa columna en la "semilla" y seleccionarlos aleatoriamente o permutarlos para las nuevas filas.
  - Para Fechas/Números sin método Faker claro: Aplicar *jitter* (variación aleatoria) basado en el valor semilla.

### 6. Core Data Generator
Conectar todo en la clase principal.
#### [MODIFY] `backend/generators/data_generator.py`
- En el método `generate()`, evaluar `if config.use_ai:`.
- Llamar a `ai_generator` para obtener la semilla.
- Llamar a `hybrid_multiplier` pasándole la semilla y la instancia de `self.fake` para rellenar la lista hasta alcanzar `record_count`.
- Conservar la lógica actual de Unique constraints y de PK offsets intacta.

## Verification Plan

### Automated/Manual Verification
- Enviar un request al backend pidiendo 10,000 registros para una tabla con `use_ai = True` y sin prompt, verificando que la IA infiera el contexto sola por el nombre de las columnas.
- Verificar el log del backend para comprobar que se hizo solo 1 llamada a la API de IA.
- Revisar manualmente que columnas como "Nombres" tengan 10,000 valores distintos (generados por Faker en el mutador) y que columnas específicas como "Categoría de Diagnóstico" tengan variaciones contextuales tomadas de la IA.
