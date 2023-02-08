import React, { memo } from "react";
import Entry from "./Entry";
import Panel from "./Panel";

export const RNConsoleComponent = memo(({ withCloseButton }: { withCloseButton?: boolean }) =>
  <>
    <Entry withCloseButton={withCloseButton} />
    <Panel />
  </>
);
