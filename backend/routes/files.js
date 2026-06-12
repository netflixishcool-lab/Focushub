import express from 'express';
import RobloxScript from '../models/RobloxScript.js';

const router = express.Router();

// GET: Roblox Loader Script - HWID validation + script execution
router.get('/loader.lua', async (req, res) => {
  try {
    const scriptKey = req.query.key || '';

    if (!scriptKey) {
      return res.status(400).send('-- Error: Missing key parameter');
    }

    // Validate key exists before sending loader
    const robloxScript = await RobloxScript.findOne({ scriptKey, isActive: true });
    if (!robloxScript) {
      return res.status(404).send('-- Error: Invalid or expired key');
    }
    if (robloxScript.expiresAt && new Date() > robloxScript.expiresAt) {
      return res.status(403).send('-- Error: Key expired');
    }

    const API = process.env.PUBLIC_API_URL || 'http://localhost:5000/api';

    const luaScript = `-- FocusHub Loader v2 -- DO NOT MODIFY
local _API = "${API}"
local _KEY = "${scriptKey}"
local _hs = game:GetService("HttpService")
local _sg = game:GetService("StarterGui")

local function _notify(t, m, d)
    pcall(function()
        _sg:SetCore("SendNotification", {Title=t, Text=m, Duration=d or 5})
    end)
end

local function _request(url, method, body)
    local headers = {["Content-Type"]="application/json",["User-Agent"]="FocusHub/2.0"}
    local opts = {Url=url, Method=method, Headers=headers, Body=body}
    local ok, res
    if syn and syn.request then
        ok, res = pcall(syn.request, opts)
    elseif request then
        ok, res = pcall(request, opts)
    elseif http_request then
        ok, res = pcall(http_request, opts)
    elseif SENTINEL_VirtualMouse then
        ok, res = pcall(request, opts)
    else
        warn("[FocusHub] HTTP nicht verfügbar in diesem Executor")
        return 0, ""
    end
    if ok and res then return res.StatusCode, res.Body end
    return 0, ""
end

-- HWID sammeln
local _hwid = ""
local _ok, _cid = pcall(function()
    return game:GetService("RbxAnalyticsService"):GetClientId()
end)
if _ok and _cid and _cid ~= "" then
    _hwid = _cid
else
    local _p = game:GetService("Players").LocalPlayer
    _hwid = _p and ("uid_"..tostring(_p.UserId)) or "unknown"
end

-- HWID registrieren / verifizieren
local _body = _hs:JSONEncode({scriptKey=_KEY, hwid=_hwid})
local _status, _resp = _request(_API.."/keys/script/register-hwid", "POST", _body)

if _status == 200 then
    _notify("FocusHub", "Verifiziert - wird geladen...", 3)
    -- Script vom Server laden
    local _s2, _r2 = _request(_API.."/keys/script/".._KEY, "GET", nil)
    if _s2 == 200 then
        local _data = _hs:JSONDecode(_r2)
        if _data and _data.script then
            local _fn, _err = loadstring(_data.script)
            if _fn then
                _fn()
            else
                warn("[FocusHub] Ladefehler: "..tostring(_err))
            end
        else
            warn("[FocusHub] Leeres Script erhalten")
        end
    elseif _s2 == 403 then
        _notify("FocusHub", "Script abgelaufen", 8)
    else
        warn("[FocusHub] Script konnte nicht abgerufen werden: "..tostring(_s2))
    end
elseif _status == 403 then
    _notify("FocusHub", "HWID gesperrt - anderes Geraet erkannt. Support kontaktieren.", 10)
    warn("[FocusHub] Zugriff verweigert: HWID stimmt nicht ueberein")
elseif _status == 410 then
    _notify("FocusHub", "Key abgelaufen", 8)
    warn("[FocusHub] Key ist abgelaufen")
elseif _status == 404 then
    _notify("FocusHub", "Ungültiger Key", 8)
    warn("[FocusHub] Key nicht gefunden")
else
    warn("[FocusHub] Verbindungsfehler (Status: "..tostring(_status)..")")
    _notify("FocusHub", "Verbindung fehlgeschlagen - Status "..tostring(_status), 6)
end
`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="loader.lua"');
    res.send(luaScript);
  } catch (error) {
    res.status(500).send('-- Server error: ' + error.message);
  }
});

export default router;
