import React, { memo, useMemo, useState } from "react"
import { View, Text, FlatList } from "react-native"
import style from "./style"
import { useRNConsoleNetworkStore } from "../../network/store"
import NetworkRow from "../NetworkRow"
import { RNConsoleNetworkRequestItem } from "../../network/requestItem"
import { RNConsole } from "../../core"
import Filter from "../Filter"
import Empty from "../Empty"

export default memo(() => {
    const [filterText, setFilterText] = useState('')
    const networkList = useRNConsoleNetworkStore()
    const data = useMemo(() => {
        const reverseNetworkList = Object.values(networkList).reverse()
        if (filterText) {
            return reverseNetworkList.filter(({ url }) =>
                url && url.toLowerCase().includes(filterText.toLowerCase()))
        }
        return reverseNetworkList
    }, [networkList, filterText])

    return <>
        <Filter
            onClear={() => RNConsole.instance?.network.clear()}
            onChangeText={text => setFilterText(text)}
            placeholder={'输入关键词以过滤请求'} />
        <View style={style.header}>
            <View style={style.name}>
                <Text style={style.text}>名称</Text>
            </View>
            <View style={style.method}>
                <Text style={style.text}>方法</Text>
            </View>
            <View style={style.status}>
                <Text style={style.text}>状态码</Text>
            </View>
            <View style={style.time}>
                <Text style={style.text}>请求时间</Text>
            </View>
        </View>
        <FlatList
            data={data}
            renderItem={({ item }) => <NetworkRow item={item as RNConsoleNetworkRequestItem} />}
            keyExtractor={(item) => `${item.id}`}
            ListEmptyComponent={<Empty text={'暂无请求'} />}
            contentContainerStyle={{ flexGrow: 1 }}
        />
    </>
})