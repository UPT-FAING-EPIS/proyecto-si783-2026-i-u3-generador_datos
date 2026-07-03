# Data Generator — AI Synthetic Data

Data Generator is a powerful Visual Studio Code extension that allows you to easily generate realistic synthetic data for your databases using Google Gemini AI and Faker.js.

## Features

- **Direct Database Connection**: Connect directly to your MySQL or PostgreSQL databases.
- **Intelligent Schema Analysis**: Automatically analyzes tables, columns, data types, and foreign key relationships.
- **Hybrid Data Generation**: 
  - Uses Google Gemini AI to generate contextual and realistic seed data.
  - Multiplies the seed data locally using Faker.js for high performance and volume.
- **Custom AI Prompts**: Add custom instructions to the AI to tailor the data strictly to your business logic.

## Usage

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Search and execute **`Data Generator: Open Panel`**.
3. Enter your database connection URI and click **Connect**.
4. Configure the number of rows for each table and optional AI settings.
5. Click **Generate Data** and watch your database fill with high-quality synthetic data!

## Configuration

You can configure the following settings in VS Code:
- `dataGenerator.geminiApiKey`: Your Google Gemini API Key for AI-powered data seeding.
- `dataGenerator.locale`: Language locale (default: `es_ES`).

## Requirements

- VS Code version 1.85.0 or higher.
- A valid Google Gemini API Key (if using the AI hybrid feature).
