# THIS FILE IS AUTO-GENERATED. DO NOT MODIFY!!

# Copyright 2020-2023 Tauri Programme within The Commons Conservancy
# SPDX-License-Identifier: Apache-2.0
# SPDX-License-Identifier: MIT

-keep class com.jbelborja.englishverbsapp.* {
  native <methods>;
}

-keep class com.jbelborja.englishverbsapp.WryActivity {
  public <init>(...);

  void setWebView(com.jbelborja.englishverbsapp.RustWebView);
  java.lang.Class getAppClass(...);
  java.lang.String getVersion();
}

-keep class com.jbelborja.englishverbsapp.Ipc {
  public <init>(...);

  @android.webkit.JavascriptInterface public <methods>;
}

-keep class com.jbelborja.englishverbsapp.RustWebView {
  public <init>(...);

  void loadUrlMainThread(...);
  void loadHTMLMainThread(...);
  void evalScript(...);
}

-keep class com.jbelborja.englishverbsapp.RustWebChromeClient,com.jbelborja.englishverbsapp.RustWebViewClient {
  public <init>(...);
}
