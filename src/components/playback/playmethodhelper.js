export function getDisplayPlayMethod(session) {
    if (!session.NowPlayingItem) {
        return null;
    }

    if (session.TranscodingInfo && session.TranscodingInfo.IsVideoDirect && session.TranscodingInfo.IsAudioDirect) {
        return 'Remux';
    } else if (session.TranscodingInfo && session.TranscodingInfo.IsVideoDirect) {
        return 'DirectStream';
    } else if (session.PlayState.PlayMethod === 'Transcode') {
        return 'Transcode';
    } else if (session.PlayState.PlayMethod === 'DirectStream') {
        return 'DirectPlay';
    } else if (session.PlayState.PlayMethod === 'DirectPlay') {
        return 'DirectPlay';
    }
}

export default {
    getDisplayPlayMethod: getDisplayPlayMethod
};
