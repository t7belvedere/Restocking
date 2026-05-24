import { Component, type ReactNode } from "react";
import { View, Text } from "react-native";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            backgroundColor: "#F9F8F6",
          }}
        >
          <Text style={{ fontFamily: "monospace", fontSize: 14, color: "red" }}>
            {this.state.error.message}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#737373",
              marginTop: 8,
            }}
          >
            {this.state.error.stack?.slice(0, 500)}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}
