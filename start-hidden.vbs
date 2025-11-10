Set objShell = CreateObject("Wscript.Shell")
objShell.Run "cmd /c cd /d """ & CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & """ && npm start", 7, False
