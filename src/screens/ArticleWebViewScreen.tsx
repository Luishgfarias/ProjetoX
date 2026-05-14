import React from "react";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { WebView } from "react-native-webview";
import { useColorScheme } from "nativewind";
import { RootStackParamList } from "../navigation/types";
import { LoadingState } from "../components/LoadingState";
import {
  NAVIGATION_DARK_THEME,
  NAVIGATION_LIGHT_THEME,
} from "../constants/theme";

type Props = NativeStackScreenProps<RootStackParamList, "ArticleWebView">;

function getArticleThemeScript({
  backgroundColor,
  textColor,
  theme,
}: {
  backgroundColor: string;
  textColor: string;
  theme: "light" | "dark";
}) {
  return `
    (function() {
      document.documentElement.style.colorScheme = "${theme}";
      document.documentElement.style.backgroundColor = "${backgroundColor}";
      document.body.style.backgroundColor = "${backgroundColor}";
      document.body.style.color = "${textColor}";

      var style = document.createElement("style");
      style.innerHTML = "html, body { background: ${backgroundColor} !important; color-scheme: ${theme}; }";
      document.head.appendChild(style);
    })();
    true;
  `;
}

export default function ArticleWebViewScreen({ route }: Props) {
  const { url } = route.params;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const webViewTheme = isDark ? "dark" : "light";
  const theme = isDark ? NAVIGATION_DARK_THEME : NAVIGATION_LIGHT_THEME;
  const articleThemeScript = getArticleThemeScript({
    backgroundColor: theme.background,
    textColor: theme.text,
    theme: webViewTheme,
  });

  return (
    <View className="flex-1 bg-app-background dark:bg-app-background-dark">
      <WebView
        injectedJavaScriptBeforeContentLoaded={articleThemeScript}
        originWhitelist={["http://*", "https://*"]}
        renderLoading={() => (
          <View className="flex-1 items-center justify-center bg-app-background dark:bg-app-background-dark">
            <LoadingState text="Carregando artigo..." />
          </View>
        )}
        setSupportMultipleWindows={false}
        source={{ uri: url }}
        startInLoadingState
        style={[styles.webView, { backgroundColor: theme.background }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
});
