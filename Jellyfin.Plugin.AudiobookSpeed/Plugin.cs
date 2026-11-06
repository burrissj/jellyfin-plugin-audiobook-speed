using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Serialization;

namespace Jellyfin.Plugin.AudiobookSpeed;

public class Plugin : BasePlugin<PluginConfiguration>
{
    public Plugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer)
        : base(applicationPaths, xmlSerializer)
    {
        Instance = this;
    }

    public static Plugin? Instance { get; private set; }

    public override string Name => "Audiobook Speed";

    public override Guid Id => Guid.Parse("b7d1c5a2-4e0f-4a6b-9c33-5f1e2d8a7c90");

    public override string Description => "Adds a playback speed control (0.25x steps) to the web audio player.";
}
