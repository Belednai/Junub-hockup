import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Download, ExternalLink } from 'lucide-react';

// App store URLs - Update these with your actual store/test links
const APP_STORE_URLS = {
  // iOS TestFlight or App Store URL
  IOS: 'https://testflight.apple.com/join/your-testflight-link', // Replace with your TestFlight link
  
  // Android Play Store or Firebase App Distribution URL
  ANDROID: 'https://play.google.com/store/apps/details?id=com.junubhockup.app', // Replace with your Play Store link
  
  // Alternative: Firebase App Distribution for Android testing
  ANDROID_TEST: 'https://appdistribution.firebase.dev/i/your-firebase-link', // Replace with Firebase App Distribution link
};

const GetApp: React.FC = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  const handleDownload = (platform: 'ios' | 'android') => {
    const url = platform === 'ios' ? APP_STORE_URLS.IOS : APP_STORE_URLS.ANDROID;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Get Junub-hockup App</CardTitle>
          <CardDescription>
            Download our mobile app for the best experience
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* iOS Download Button */}
          <Button
            onClick={() => handleDownload('ios')}
            className="w-full h-14 bg-black hover:bg-gray-800 text-white"
            variant="default"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">📱</span>
              </div>
              <div className="text-left">
                <div className="text-xs opacity-80">Download on the</div>
                <div className="font-semibold">App Store</div>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </div>
          </Button>

          {/* Android Download Button */}
          <Button
            onClick={() => handleDownload('android')}
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white"
            variant="default"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">🤖</span>
              </div>
              <div className="text-left">
                <div className="text-xs opacity-80">Get it on</div>
                <div className="font-semibold">Google Play</div>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </div>
          </Button>

          {/* Smart Download Button - Shows based on device */}
          {(isIOS || isAndroid) && (
            <div className="pt-4 border-t">
              <Button
                onClick={() => handleDownload(isIOS ? 'ios' : 'android')}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download for {isIOS ? 'iOS' : 'Android'}
              </Button>
            </div>
          )}

          {/* Web App Notice */}
          <div className="text-center text-sm text-gray-600 pt-4">
            <p>You can also use Junub-hockup directly in your browser!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GetApp;
