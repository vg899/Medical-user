import { Smartphone, Download, Folder, File, Component } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-green-500/20 rounded-2xl">
            <Smartphone className="w-10 h-10 text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">MediHub Android Project</h1>
            <p className="text-neutral-400">Native Kotlin implementation generated successfully</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8 text-sm leading-relaxed">
          <p className="mb-4">
            Since AI Studio is a web-based sandbox, I have generated your entire native Android Studio project into the workspace file system rather than attempting to run Java/Kotlin in the browser. 
          </p>
          <p className="mb-4 text-white font-medium">
            How to use this code:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-neutral-300">
            <li>Click the Export / Settings menu in the top right corner of AI Studio.</li>
            <li>Select <strong>"Export as ZIP"</strong> to download the full workspace.</li>
            <li>Extract the ZIP and open the <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-green-300">MedicineDeliveryApp</code> folder in <strong>Android Studio</strong>.</li>
            <li>Sync Gradle, set up your <code>google-services.json</code> if needed (it comes pre-filled with your provided config in string format for immediate use), and hit Run!</li>
          </ol>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="bg-neutral-950 border-b border-neutral-800 px-4 py-3 flex items-center gap-2">
            <Folder className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-sm">MedicineDeliveryApp</span>
          </div>
          <div className="p-4 text-xs font-mono text-neutral-400 space-y-2">
            <div className="pl-4 flex items-center gap-2"><File className="w-3 h-3"/> build.gradle.kts (Project)</div>
            <div className="pl-4 flex items-center gap-2"><File className="w-3 h-3"/> settings.gradle.kts</div>
            <div className="pl-4 flex flex-col gap-2">
              <div className="flex items-center gap-2"><Folder className="w-3 h-3 text-blue-400"/> app</div>
              <div className="pl-4 flex items-center gap-2"><File className="w-3 h-3"/> build.gradle.kts (Module)</div>
              <div className="pl-4 flex items-center gap-2"><Folder className="w-3 h-3 text-blue-400"/> src/main</div>
              <div className="pl-8 flex items-center gap-2"><File className="w-3 h-3"/> AndroidManifest.xml</div>
              <div className="pl-8 flex items-center gap-2 -mb-1 mt-1 text-green-400">Kotlin Code</div>
              <div className="pl-8 flex items-center gap-2"><Folder className="w-3 h-3 text-blue-400"/> java/com/medihub/android</div>
              <div className="pl-12 flex items-center gap-2"><Component className="w-3 h-3 text-purple-400"/> SplashActivity.kt</div>
              <div className="pl-12 flex items-center gap-2"><Component className="w-3 h-3 text-purple-400"/> AuthActivity.kt</div>
              <div className="pl-12 flex items-center gap-2"><Component className="w-3 h-3 text-purple-400"/> HomeActivity.kt</div>
              <div className="pl-12 flex items-center gap-2"><Component className="w-3 h-3 text-purple-400"/> CartCheckoutActivity.kt</div>
              <div className="pl-12 flex items-center gap-2"><Component className="w-3 h-3 text-purple-400"/> TrackingActivity.kt</div>
              <div className="pl-12 flex items-center gap-2"><File className="w-3 h-3"/> Models.kt</div>
              <div className="pl-12 flex items-center gap-2"><File className="w-3 h-3"/> Adapters.kt</div>
              <div className="pl-12 flex items-center gap-2"><File className="w-3 h-3"/> CloudinaryUploader.kt</div>
              <div className="pl-8 flex items-center gap-2 -mb-1 mt-1 text-blue-300">XML Layouts (No Compose)</div>
              <div className="pl-8 flex items-center gap-2"><Folder className="w-3 h-3 text-blue-400"/> res/layout</div>
              <div className="pl-12 flex items-center gap-2"><File className="w-3 h-3 text-orange-400"/> activity_splash.xml</div>
              <div className="pl-12 flex items-center gap-2"><File className="w-3 h-3 text-orange-400"/> activity_auth.xml</div>
              <div className="pl-12 flex items-center gap-2"><File className="w-3 h-3 text-orange-400"/> activity_home.xml</div>
              <div className="pl-12 flex items-center gap-2"><File className="w-3 h-3 text-orange-400"/> activity_checkout.xml</div>
              <div className="pl-12 flex items-center gap-2"><File className="w-3 h-3 text-orange-400"/> activity_tracking.xml</div>
              <div className="pl-12 flex items-center gap-2"><File className="w-3 h-3 text-orange-400"/> item_medicine.xml</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
