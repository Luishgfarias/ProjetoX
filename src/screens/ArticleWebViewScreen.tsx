import React from "react";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { WebView } from "react-native-webview";
import { RootStackParamList } from "../navigation/types";
import { LoadingState } from "../components/LoadingState";
import { useAppTheme } from "../theme/ThemeProvider";

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
  const { colors, resolvedTheme } = useAppTheme();
  const articleThemeScript = getArticleThemeScript({
    backgroundColor: colors.background,
    textColor: colors.text,
    theme: resolvedTheme,
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
        style={[styles.webView, { backgroundColor: colors.background }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
});
