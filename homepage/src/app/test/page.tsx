import { TextUpTransitionView } from "@/components/TextUpTransitionView";

export default function Page() {
    return (
<TextUpTransitionView
                    initialDelay={1000 * 0.05}
                    eachDelay={0.05}
                  >
                    {"1234"}
                  </TextUpTransitionView>
    )
}
