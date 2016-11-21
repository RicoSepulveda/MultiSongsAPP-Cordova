package audio.multisongs.plugin;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;

import com.google.android.exoplayer2.DefaultLoadControl;
import com.google.android.exoplayer2.ExoPlayerFactory;
import com.google.android.exoplayer2.LoadControl;
import com.google.android.exoplayer2.SimpleExoPlayer;
import com.google.android.exoplayer2.extractor.DefaultExtractorsFactory;
import com.google.android.exoplayer2.extractor.ExtractorsFactory;
import com.google.android.exoplayer2.source.ExtractorMediaSource;
import com.google.android.exoplayer2.source.MediaSource;
import com.google.android.exoplayer2.trackselection.DefaultTrackSelector;
import com.google.android.exoplayer2.trackselection.TrackSelector;
import com.google.android.exoplayer2.upstream.DefaultHttpDataSourceFactory;
import com.google.android.exoplayer2.upstream.FileDataSourceFactory;

import android.content.Context;
import android.net.Uri;
import android.os.Handler;

public class AudioPlugin extends CordovaPlugin{

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        // TODO Auto-generated method stub
        super.initialize(cordova, webView);
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        
        Context context=this.cordova.getActivity().getApplicationContext(); 
        
        Handler handler = new Handler();
        TrackSelector trackSelector = new DefaultTrackSelector(handler);
        LoadControl loadControl = new DefaultLoadControl();
        SimpleExoPlayer exoPlayer = ExoPlayerFactory.newSimpleInstance(context, trackSelector, loadControl);

        Uri audioUri = Uri.parse(args.getString(0));
        callbackContext.success();
        DefaultHttpDataSourceFactory dataSourceFactory = new DefaultHttpDataSourceFactory("ExoPlayerDemo");
        ExtractorsFactory extractor = new DefaultExtractorsFactory();
        MediaSource audioSource = new ExtractorMediaSource(audioUri, dataSourceFactory, extractor, null, null);
        exoPlayer.prepare(audioSource);
        exoPlayer.setPlayWhenReady(true);
        
        return true;
        
    }

    
    
}
