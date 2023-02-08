import React, { memo, useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { RNConsoleNetworkRequestItem } from "../../network/requestItem";
import style from "./style";
import { getDate } from "../../lib/tool";

export default memo(({ item }: { item: RNConsoleNetworkRequestItem }) => {
    const [showDetail, setShowDetail] = useState(false)
    const [blobText, setBlobText] = useState('')

    const rowColor = useMemo(() => {
        const { statusText } = item
        switch (true) {
            case statusText?.startsWith('2'):
                return '#4BA553';
            case statusText?.startsWith('3'):
                return '#4079F6';
            case statusText?.startsWith('4'):
            case statusText?.startsWith('5'):
                return '#D74434';
            case statusText?.startsWith('Pending'):
                return '#FF8C00';
            default:
                return 'black';
        }
    }, [item.statusText])

    useEffect(() => {
        if (item.responseType === 'blob' && item.response) {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                if (fileReader.result) {
                    let res = fileReader.result as string
                    if (res.startsWith('{') || res.startsWith('[')) {
                        try {
                            res = JSON.parse(res)
                        } catch (error) {
                            console.error(error)
                        }
                    }
                    setBlobText(res)
                }
            };
            fileReader.readAsText(item.response);
        }
    }, [item.responseType, item.response, setBlobText])

    const { hour, minute, second, millisecond } = getDate(item.startTime)

    return <View style={style.rowWrapper}>
        <TouchableOpacity style={style.desc} onPress={() => setShowDetail(!showDetail)}>
            <View style={style.name}>
                <Text style={{ color: rowColor }} numberOfLines={1}>{item.name}</Text>
            </View>
            <View style={style.method}>
                <Text style={{ color: rowColor }}>{item.method}</Text>
            </View>
            <View style={style.status}>
                <Text style={{ color: rowColor }}>{item.statusText}</Text>
            </View>
            <View style={style.time}>
                <Text style={{ color: rowColor }}>{`${hour}:${minute}:${second}.${millisecond}`}</Text>
            </View>
        </TouchableOpacity>
        {showDetail && <View style={style.detailWrapper}>
            <Text style={style.detail}>
                <Text style={style.label}>url: </Text>
                {item.url}
            </Text>
            <Text style={style.detail}>
                <Text style={style.label}>持续时间: </Text>
                {item.costTime} ms
            </Text>
            <Text style={style.detail}>
                <Text style={style.label}>响应体: </Text>
                {JSON.stringify(blobText, null, 2)}
            </Text>
            <Text style={style.detail}>
                <Text style={style.label}>载荷: </Text>
                {JSON.stringify(item.method === 'GET' ? item.getData : item.postData, null, 2)}
            </Text>
            <Text style={style.detail}>
                <Text style={style.label}>请求头: </Text>
                {JSON.stringify(item.requestHeader, null, 2)}
            </Text>
            <Text style={style.detail}>
                <Text style={style.label}>响应头: </Text>
                {JSON.stringify(item.header, (_, value) => {
                    if (typeof value === 'string') {
                        return value.replace(/\r$/, '')
                    }
                    return value
                }, 2)}
            </Text>
            <Text style={style.detail}>
                <Text style={style.label}>响应类型: </Text>
                {item.responseType}
            </Text>
        </View>}
    </View >
})