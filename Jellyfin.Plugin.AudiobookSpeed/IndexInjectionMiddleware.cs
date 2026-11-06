using System.Text;
using Microsoft.AspNetCore.Http;

namespace Jellyfin.Plugin.AudiobookSpeed;

/// <summary>Injects our script tag into the web client's index.html (works for the web UI and WebView-based apps).</summary>
public class IndexInjectionMiddleware
{
    private const string Tag = "<script src=\"../AudiobookSpeed/script.js?v=1.0.4.0\" defer></script>";
    private readonly RequestDelegate _next;

    public IndexInjectionMiddleware(RequestDelegate next) => _next = next;

    public async Task Invoke(HttpContext context)
    {
        var path = context.Request.Path.Value ?? string.Empty;
        var isIndex = HttpMethods.IsGet(context.Request.Method)
            && (path.EndsWith("/web/index.html", StringComparison.OrdinalIgnoreCase)
                || path.EndsWith("/web/", StringComparison.OrdinalIgnoreCase)
                || path.EndsWith("/web", StringComparison.OrdinalIgnoreCase));

        if (!isIndex)
        {
            await _next(context);
            return;
        }

        // Ask upstream for an uncompressed body so we can edit it.
        context.Request.Headers.Remove("Accept-Encoding");
        context.Request.Headers.Remove("If-None-Match");
        context.Request.Headers.Remove("If-Modified-Since");

        var original = context.Response.Body;
        await using var buffer = new MemoryStream();
        context.Response.Body = buffer;
        try
        {
            await _next(context);
        }
        finally
        {
            context.Response.Body = original;
        }

        buffer.Seek(0, SeekOrigin.Begin);
        var contentType = context.Response.ContentType ?? string.Empty;
        if (context.Response.StatusCode == 200 && contentType.Contains("text/html", StringComparison.OrdinalIgnoreCase))
        {
            var html = Encoding.UTF8.GetString(buffer.ToArray());
            var idx = html.LastIndexOf("</body>", StringComparison.OrdinalIgnoreCase);
            if (idx >= 0 && !html.Contains("AudiobookSpeed/script.js", StringComparison.Ordinal))
            {
                html = html.Insert(idx, Tag);
            }

            var bytes = Encoding.UTF8.GetBytes(html);
            context.Response.Headers.Remove("ETag");
            context.Response.Headers.Remove("Last-Modified");
            context.Response.ContentLength = bytes.Length;
            await original.WriteAsync(bytes);
        }
        else
        {
            await buffer.CopyToAsync(original);
        }
    }
}
