-- FocusHub Roblox Script Loader
-- Diesen Code in deinen Roblox Executor einfügen
-- Der Script wird automatisch vom Server heruntergeladen und ausgeführt

local API_URL = "http://localhost:5000/api"

-- Funktion zum Anzeigen von Meldungen
local function showMessage(title, message, isError)
    print("[FocusHub] " .. title .. ": " .. message)
    if getgenv().Discord then
        getgenv().Discord.message(isError and "❌" or "✓", title, message)
    end
end

-- Funktion zum Herunterladen des Scripts
local function downloadScript(scriptKey)
    showMessage("Info", "Lade Script herunter... Script Key: " .. scriptKey, false)
    
    -- Mit HTTP-Requests des Executors arbeiten
    if httprequest then
        local response = httprequest({
            Url = API_URL .. "/scripts/download/" .. scriptKey,
            Method = "GET",
            Headers = {
                ["User-Agent"] = "FocusHub-Roblox/1.0"
            }
        })
        
        if response.StatusCode == 200 then
            showMessage("Erfolg", "Script heruntergeladen!", false)
            return response.Body
        else
            showMessage("Fehler", "Script konnte nicht heruntergeladen werden. Status: " .. response.StatusCode, true)
            return nil
        end
    elseif http.request then
        -- Alternative für manche Executoren
        local success, response = pcall(function()
            return http.request({
                Url = API_URL .. "/scripts/download/" .. scriptKey,
                Method = "GET",
                Headers = {
                    ["User-Agent"] = "FocusHub-Roblox/1.0"
                }
            })
        end)
        
        if success and response then
            showMessage("Erfolg", "Script heruntergeladen!", false)
            return response.Body or response
        else
            showMessage("Fehler", "Script konnte nicht heruntergeladen werden", true)
            return nil
        end
    else
        showMessage("Fehler", "HTTP-Requests nicht unterstützt in diesem Executor", true)
        return nil
    end
end

-- Funktion zum Ausführen des Scripts
local function executeScript(scriptCode)
    showMessage("Status", "Führe Script aus...", false)
    
    local success, result = pcall(function()
        if loadstring then
            return loadstring(scriptCode)()
        else
            -- Fallback für manche Executoren
            return assert(load(scriptCode))()
        end
    end)
    
    if success then
        showMessage("Erfolg", "Script erfolgreich ausgeführt!", false)
        return true
    else
        showMessage("Fehler", "Fehler beim Ausführen: " .. tostring(result), true)
        return false
    end
end

-- Hauptfunktion
local function main()
    showMessage("Start", "FocusHub Roblox Loader gestartet", false)
    
    -- Discord Key eingeben (wird vom Bot im Nachricht eingefügt)
    local scriptKey = "[SCRIPT_KEY_PLACEHOLDER]"
    
    -- Falls Script Key leer ist, vom Benutzer abfragen
    if scriptKey == "[SCRIPT_KEY_PLACEHOLDER]" or scriptKey == "" then
        showMessage("Input", "Bitte Script Key eingeben", false)
        if getgenv().askForInput then
            scriptKey = getgenv().askForInput("FocusHub", "Gib deinen Script Key ein:")
        else
            print("Script Key erforderlich: " .. API_URL .. "/scripts/download/YOUR_SCRIPT_KEY")
            return
        end
    end
    
    -- Script herunterladen
    local scriptCode = downloadScript(scriptKey)
    
    if scriptCode then
        -- Script ausführen
        executeScript(scriptCode)
    else
        showMessage("Fehler", "Script konnte nicht geladen werden", true)
    end
end

-- Starte die Main-Funktion
main()

print("[FocusHub] Roblox Loader beendet")
