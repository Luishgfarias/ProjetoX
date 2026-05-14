import { useCallback, useRef, useState } from "react";
import { BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const EXIT_HINT_TIMEOUT_MS = 2500;

export function useDoubleBackExit() {
  const [isExitHintVisible, setIsExitHintVisible] = useState(false);
  const shouldExitOnBackPress = useRef(false);
  const exitHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      const clearExitHint = () => {
        shouldExitOnBackPress.current = false;
        setIsExitHintVisible(false);

        if (exitHintTimeoutRef.current) {
          clearTimeout(exitHintTimeoutRef.current);
          exitHintTimeoutRef.current = null;
        }
      };

      const backSubscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (shouldExitOnBackPress.current) {
            clearExitHint();
            BackHandler.exitApp();
            return true;
          }

          shouldExitOnBackPress.current = true;
          setIsExitHintVisible(true);

          exitHintTimeoutRef.current = setTimeout(() => {
            shouldExitOnBackPress.current = false;
            setIsExitHintVisible(false);
            exitHintTimeoutRef.current = null;
          }, EXIT_HINT_TIMEOUT_MS);

          return true;
        },
      );

      return () => {
        backSubscription.remove();
        clearExitHint();
      };
    }, []),
  );

  return {
    isExitHintVisible,
  };
}
