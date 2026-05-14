import React from "react";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { WebView } from "react-native-webview";
import { RootStackParamList } from "../navigation/types";
import { LoadingState } from "../components/LoadingState";

type Props = NativeStackScreenProps<RootStackParamList, "ArticleWebView">;

export default function ArticleWebViewScreen({ route }: Props) {
  const { url } = route.params;

  return (
    <View className="flex-1 bg-white">
      <WebView
        originWhitelist={["http://*", "https://*"]}
        renderLoading={() => (
          <View className="flex-1 items-center justify-center bg-white">
            <LoadingState text="Carregando artigo..." />
          </View>
        )}
        setSupportMultipleWindows={false}
        source={{ uri: url }}
        startInLoadingState
        style={styles.webView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
});
