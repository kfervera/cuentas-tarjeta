#!/usr/bin/env python3
"""
Desencripta un PDF de estado de cuenta protegido con contraseña.

Uso:
  python decrypt_pdf.py <input.pdf> <output.pdf>

La contraseña se toma de la variable de entorno GASTOS_PDF_PASSWORD si existe;
si no, se pide de forma interactiva (no queda en el historial de comandos).
"""
import sys
import os
import getpass

import pikepdf


def main():
    if len(sys.argv) != 3:
        print("Uso: python decrypt_pdf.py <input.pdf> <output.pdf>")
        sys.exit(1)

    input_path, output_path = sys.argv[1], sys.argv[2]

    if not os.path.isfile(input_path):
        print(f"Error: no se encontró el archivo {input_path}")
        sys.exit(1)

    password = os.environ.get("GASTOS_PDF_PASSWORD") or getpass.getpass(
        "Contraseña del PDF: "
    )

    try:
        with pikepdf.open(input_path, password=password) as pdf:
            pdf.save(output_path)
    except pikepdf.PasswordError:
        print("Error: contraseña incorrecta.")
        sys.exit(1)

    print(f"PDF desencriptado guardado en: {output_path}")


if __name__ == "__main__":
    main()
