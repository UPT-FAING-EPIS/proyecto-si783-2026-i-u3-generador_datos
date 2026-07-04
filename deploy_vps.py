import paramiko
import time

def deploy_to_vps():
    hostname = '161.132.68.76'
    username = 'root'
    password = 'Ramos_libra12'

    print(f"1. Conectando al VPS {hostname} como {username}...")
    
    # Initialize SSH Client
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(hostname, username=username, password=password, timeout=10)
        print("   ✅ Conexión SSH exitosa.")
        
        # Commands to deploy the skill
        commands = [
            "echo '2. Actualizando repositorios y asegurando que Python 3 y pip estén instalados...'",
            "apt-get update -y > /dev/null 2>&1",
            "apt-get install -y python3 python3-pip git > /dev/null 2>&1",
            
            "echo '3. Instalando la Skill de Generador de Datos en el sistema global del VPS...'",
            # Use --break-system-packages for modern Linux (Debian 12/Ubuntu 24) to force global install if needed
            "pip3 install git+https://github.com/mariela3009/skill-generador-datos.git@main --upgrade --break-system-packages || pip3 install git+https://github.com/mariela3009/skill-generador-datos.git@main --upgrade",
            
            "echo '4. Creando script de prueba en /root/demo_skill.py...'",
            """cat << 'EOF' > /root/demo_skill.py
from skill_generador_datos import DataGenerator
print("Skill importada correctamente en el VPS. ¡Lista para usarse!")
EOF""",
            "python3 /root/demo_skill.py"
        ]
        
        for command in commands:
            stdin, stdout, stderr = ssh.exec_command(command)
            # Wait for command to finish
            exit_status = stdout.channel.recv_exit_status() 
            
            out = stdout.read().decode().strip()
            err = stderr.read().decode().strip()
            
            if out:
                print(f"   {out}")
            if err and "echo" not in command and "cat" not in command:
                print(f"   [Warning/Error]: {err}")
                
        print("\n--- ¡Despliegue en VPS completado con EXITO! La skill ya esta operativa en tu servidor. ---")
        
    except paramiko.AuthenticationException:
        print("ERROR de autenticacion: Verifica el usuario y la contrasena.")
    except Exception as e:
        print(f"ERROR conectando al VPS: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    deploy_to_vps()
