import React, { Dispatch, memo, SetStateAction } from "react";
import { FlatList, Text } from "react-native";
import { useRNConsoleSystemStore } from "../../log/store";
import style from "./style";
import CustomPage from "../CustomPage";

export default memo(({ setShowSystemInfo }: { setShowSystemInfo: Dispatch<SetStateAction<boolean>> }) => {
    const systemInfo = useRNConsoleSystemStore()

    return <CustomPage title="系统信息" onClose={() => setShowSystemInfo(false)}>
        <FlatList
            data={Object.keys(systemInfo ?? {}).map(attr => systemInfo?.[attr])}
            renderItem={({ item }) => {
                if (!item) {
                    return null
                }
                return <Text style={style.row}>
                    <Text style={style.label}>
                        {item.key}：
                    </Text>
                    {item.value}
                </Text>
            }}
        />
    </CustomPage>
})