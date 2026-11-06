using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.AudiobookSpeed;

public class PluginConfiguration : BasePluginConfiguration
{
    public double Step { get; set; } = 0.25;
    public double FineStep { get; set; } = 0.05;
    public double MinSpeed { get; set; } = 0.5;
    public double MaxSpeed { get; set; } = 3.0;
}
