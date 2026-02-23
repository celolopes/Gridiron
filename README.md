# Gridiron

A comprehensive system for sports league management.

## Configuração em Rede Corporativa (Database)

Se a sua rede corporativa bloqueia acesso DNS a domínios `*.supabase.co` ou a porta de acesso `5432`, e a conexão retorna falha local, siga este procedimento de emergência para manter seu ambiente de desenvolvimento operante através do hostname padrão:

1. **Abra o Bloco de Notas (Notepad) como Administrador** no Windows.
2. Acesse o arquivo `C:\Windows\System32\drivers\etc\hosts`.
3. Descubra o IP mais recente do servidor de banco de dados do Supabase roteando via hotspot/4G (ex: `ping db.mpfqpueldajpmphahezr.supabase.co`).
4. **Adicione a seguinte linha** no final do arquivo:
   ```
   52.67.1.88 db.mpfqpueldajpmphahezr.supabase.co
   ```
   _(Nota: O IP `52.67.1.88` é um exemplo para teste, procure utilizar o IP dinâmico oficial se esse mudar)._
5. Salve o arquivo.
6. Abra o Prompt de Comando ou PowerShell e execute:
   ```powershell
   ipconfig /flushdns
   ```
7. Reinicie sua API (`pnpm --filter api run start:dev`). A conexão primária configurada como `DATABASE_URL` no `.env` passará a conectar nativamente.
