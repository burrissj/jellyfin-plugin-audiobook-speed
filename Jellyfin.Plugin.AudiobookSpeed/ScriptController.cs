using System.Globalization;
using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jellyfin.Plugin.AudiobookSpeed;

[ApiController]
[Route("AudiobookSpeed")]
public class ScriptController : ControllerBase
{
    [HttpGet("script.js")]
    [AllowAnonymous]
    [Produces("application/javascript")]
    public ActionResult GetScript()
    {
        var asm = Assembly.GetExecutingAssembly();
        var name = asm.GetManifestResourceNames().First(n => n.EndsWith("audiobook-speed.js", StringComparison.Ordinal));
        using var reader = new StreamReader(asm.GetManifestResourceStream(name)!);
        var cfg = Plugin.Instance?.Configuration ?? new PluginConfiguration();
        var inv = CultureInfo.InvariantCulture;
        var js = reader.ReadToEnd()
            .Replace("__STEP__", cfg.Step.ToString(inv), StringComparison.Ordinal)
            .Replace("__FINE__", cfg.FineStep.ToString(inv), StringComparison.Ordinal)
            .Replace("__MIN__", cfg.MinSpeed.ToString(inv), StringComparison.Ordinal)
            .Replace("__MAX__", cfg.MaxSpeed.ToString(inv), StringComparison.Ordinal);
        Response.Headers.CacheControl = "no-cache";
        return Content(js, "application/javascript");
    }
}
