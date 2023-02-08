import React, { Dispatch, memo, SetStateAction } from "react";
import { Text, View } from "react-native";
import style from "./style";
import CustomPage from "../CustomPage";
import { ICONS } from "../Panel";

export default memo(({ setShowHelp }: { setShowHelp: Dispatch<SetStateAction<boolean>> }) =>
    <CustomPage title={'帮助'} onClose={() => setShowHelp(false)}>
        {ICONS.map(({ name, icon, desc }) =>
            <View key={name} style={style.item}>
                <View key={name} style={[style.icon, style[name]]} >
                    <Text style={style.iconText}>{icon}</Text>
                </View>
                <Text style={style.desc}>{desc}</Text>
            </View>
        )}
    </CustomPage>
)