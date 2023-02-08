import React, { memo, useCallback, useMemo, useState } from "react";
import { FlatList, View } from "react-native"
import style from "./style";
import { useRNConsoleLogStore } from "../../log/store";
import { RNConsole } from "../../core";
import Filter from "../Filter";
import { IConsoleLogMethod, IRNConsoleLog } from "../../log/model";
import ConsoleType from "../ConsoleType";
import Empty from "../Empty";
import LogRow from "../LogRow";

export default memo(() => {
    const [filterText, setFilterText] = useState('')
    const [types, setTypes] = useState({
        log: true,
        info: true,
        debug: true,
        warn: true,
        error: true,
    })
    const logList = useRNConsoleLogStore()
    const data = useMemo(() => {
        const reverseLogList = [...logList].reverse().filter(({ type }) => types[type])
        if (filterText) {
            return reverseLogList.filter(({ data }) => {
                for (const { origData } of data) {
                    if (origData &&
                        JSON.stringify(origData)?.toLowerCase()?.includes(filterText.toLowerCase())) {
                        return true
                    }
                }
                return false
            })
        }
        return reverseLogList
    }, [logList, filterText, types])
    const changeTypes = useCallback((type: IConsoleLogMethod) =>
        setTypes({ ...types, [type]: !types[type] })
        , [types, setTypes])

    return <>
        <Filter
            onClear={() => RNConsole.instance?.log.clear()}
            onChangeText={text => setFilterText(text)}
            placeholder={'输入关键词以过滤日志'} />
        <View style={style.typesWrapper}>
            <ConsoleType title="log" state={[types, changeTypes]} />
            <ConsoleType title="info" state={[types, changeTypes]} />
            <ConsoleType title="debug" state={[types, changeTypes]} />
            <ConsoleType title="warn" state={[types, changeTypes]} />
            <ConsoleType title="error" state={[types, changeTypes]} />
        </View>
        <FlatList
            data={data}
            renderItem={({ item }) => <LogRow item={item as IRNConsoleLog} />}
            keyExtractor={(item) => `${item._id}`}
            ListEmptyComponent={<Empty text={'暂无日志'} />}
            contentContainerStyle={{ flexGrow: 1 }}
        />
    </>
})