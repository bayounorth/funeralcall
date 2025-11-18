package com.omnienterprises.funeralcall;

//
//import com.omnienterprises.funeralcall.generated.BasePackageList;

import android.app.Application;
import android.content.Context;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;

import java.util.List;
//import com.tsg.funeralcall.BuildConfig;
//import com.omnienterprises.funeralcall.BuildConfig;

public class MainApplication extends Application implements ReactApplication {

//  private final ReactModuleRegistryProvider mModuleRegistryProvider = new ReactModuleRegistryProvider(new BasePackageList().getPackageList(), null);

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return false;
//            return BuildConfig.DEBUG;

        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());

          // Add unimodules
//          List<ReactPackage> unimodules = Arrays.<ReactPackage>asList(
//                  new ModuleRegistryAdapter(mModuleRegistryProvider)
//          );
//          packages.addAll(unimodules);

          // packages.add(new ReactNativePushNotificationPackage());

          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
//    SoLoader.init(this, /* native exopackage */ false);
//    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }

  /**
   * Loads Flipper in React Native templates. Call this in the onCreate method with something like
   * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
   *
   * @param context
   * @param reactInstanceManager
   */
  private static void initializeFlipper(
      Context context, ReactInstanceManager reactInstanceManager) {

  }
}
