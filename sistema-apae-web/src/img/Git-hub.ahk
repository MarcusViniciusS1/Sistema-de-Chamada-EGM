#Requires AutoHotkey v2.0

F1::
{
    ; 1. Abre a caixa de texto pedindo a mensagem
    ib := InputBox("Digite a mensagem do commit:", "Git Automator")

    ; 2. Se você apertar Cancelar ou Esc, o script para aqui
    if (ib.Result = "Cancel")
        return

    ; 3. Executa a sequência de comandos
    Send "git status{Enter}"
    Sleep 500  ; Pausa curta para o terminal processar
    
    Send "git add .{Enter}"
    Sleep 500
    
    ; Envia o commit com a mensagem digitada (ib.Value) entre aspas
    Send 'git commit -m "' ib.Value '"{Enter}'
    Sleep 500
    
    Send "git push -f origin main{Enter}"
}