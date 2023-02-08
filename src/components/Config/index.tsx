import React, { Dispatch, memo, SetStateAction, useCallback, useState } from "react";
import { KeyboardAvoidingView, Text, TextInput, TouchableOpacity, View } from "react-native";
import CustomPage from "../CustomPage";
import style from "./style";
import { MAX_LOG_NUMBER } from "../../log";
import { MAX_NETWORK_NUMBER } from "../../network";
import { RNConsole } from "../../core";

export default memo(({ setShowConfig }: { setShowConfig: Dispatch<SetStateAction<boolean>> }) => {
    const [maxLogNumber, setMaxLogNumber] = useState(`${RNConsole.instance?.option?.log?.maxLogNumber ?? MAX_LOG_NUMBER}`)
    const [maxNetworkNumber, setMaxNetworkNumber] = useState(`${RNConsole.instance?.option?.network?.maxNetworkNumber ?? MAX_NETWORK_NUMBER}`)
    const changeMaxLogNumber = useCallback((text: string) => setMaxLogNumber(text.replace(/[^0-9]/g, '')), [])
    const changeMaxNetworkNumber = useCallback((text: string) => setMaxNetworkNumber(text.replace(/[^0-9]/g, '')), [])
    const setConfig = useCallback(() => {
        RNConsole.instance?.setOption('log.maxLogNumber', maxLogNumber)
        RNConsole.instance?.setOption('network.maxNetworkNumber', maxNetworkNumber)
        setShowConfig(false)
    }, [maxLogNumber, maxNetworkNumber])

    return <CustomPage title={'设置'} onClose={() => setShowConfig(false)}>
        <KeyboardAvoidingView behavior="padding" style={style.wrapper}>
            <View style={style.item}>
                <Text style={style.label}>最大日志记录条数：</Text>
                <TextInput style={style.input} placeholder={'请输入整数'} clearButtonMode={'while-editing'}
                    onChangeText={changeMaxLogNumber} keyboardType={'numeric'} value={maxLogNumber} />
            </View>
            <View style={style.item}>
                <Text style={style.label}>最大请求记录条数：</Text>
                <TextInput style={style.input} placeholder={'请输入整数'} clearButtonMode={'while-editing'}
                    onChangeText={changeMaxNetworkNumber} keyboardType={'numeric'} value={maxNetworkNumber} />
            </View>
            <TouchableOpacity onPress={setConfig} style={style.item} >
                <Text style={[style.label, style.button]}>确定</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    </CustomPage>
})