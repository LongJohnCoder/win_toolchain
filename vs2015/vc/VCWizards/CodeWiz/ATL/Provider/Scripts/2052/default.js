// Copyright (c) Microsoft Corporation. All rights reserved.
// Script for ATL Provider

function OnPrep(selProj, selObj)
{
	var L_WizardDialogTitle_Text = "ATL OLE DB 提供程序向导";
	return PrepCodeWizard(selProj, L_WizardDialogTitle_Text);
}

function OnFinish(selProj, selObj)
{
	var oCM;
	try
	{		
		oCM	= selProj.CodeModel;

		var strShortName = wizard.FindSymbol("SHORT_NAME");
		var L_TransactionName_Text = "添加 ATL 提供程序 ";
		oCM.StartTransaction(L_TransactionName_Text + strShortName);
		if(!AddATLSupportToProject(selProj))
		{
			oCM.AbortTransaction();
			return;
		}

		var strProjectPath		= wizard.FindSymbol("PROJECT_PATH");
		var strTemplatePath		= wizard.FindSymbol("TEMPLATES_PATH");
		var strUpperShortName	= CreateASCIIName(strShortName.toUpperCase());
		wizard.AddSymbol("UPPER_SHORT_NAME", strUpperShortName);
		wizard.AddSymbol("TYPE_NAME", strShortName + " Class");
		var strVIProgID			= wizard.FindSymbol("VERSION_INDEPENDENT_PROGID");
		if (strVIProgID == null || strVIProgID == "")
		{
			wizard.AddSymbol("PROGID_VALID", false);
			wizard.AddSymbol("VERSION_INDEPENDENT_PROGID","");
			wizard.AddSymbol("PROGID","");
		}
		else
		{
			wizard.AddSymbol("PROGID_VALID", true);
			wizard.AddSymbol("PROGID", strVIProgID + "." + wizard.FindSymbol("VERSION"));
		}
		var strCoClass			= wizard.FindSymbol("COCLASS");
		var bAttributed			= wizard.FindSymbol("ATTRIBUTED");

		var strDataSourceHeader	= wizard.FindSymbol("DATASOURCE_HEADER");
		var strSessionHeader	= wizard.FindSymbol("SESSION_HEADER");
		var strRowsetHeader		= wizard.FindSymbol("ROWSET_HEADER");
		var strRowsetImpl		= wizard.FindSymbol("ROWSET_IMPL");
		var strDataSourceClass	= wizard.FindSymbol("DATASOURCE_CLASS");

		var strProjectRC		= GetProjectFile(selProj, "RC", true, false);
		var strRGSFile;

		// Create necessary GUIDS
		CreateGUIDs();

		var oResHelper = wizard.ResourceHelper;
		oResHelper.OpenResourceFile(strProjectRC);

		// add string resources
		var L_RCTEXT1_TEXT =  "活动会话";
		var strSymbolValue = oResHelper.AddResource("IDS_DBPROP_ACTIVESESSIONS", L_RCTEXT1_TEXT, "STRING");
		// In theory we should check after each addition. In practive however this check guards agains SCC chekout cancelations.
		// This will either fire in the first attempt or will not fire, so furhter checks are unnecessary.
		if (strSymbolValue == null) return;
		var L_RCTEXT2_TEXT =  "可异步提交";
		oResHelper.AddResource("IDS_DBPROP_ASYNCTXNCOMMIT", L_RCTEXT2_TEXT, "STRING");
		var L_RCTEXT3_TEXT =  "传递 By Ref 访问器";
		oResHelper.AddResource("IDS_DBPROP_BYREFACCESSORS", L_RCTEXT3_TEXT, "STRING");
		var L_RCTEXT4_TEXT =  "目录位置";
		oResHelper.AddResource("IDS_DBPROP_CATALOGLOCATION", L_RCTEXT4_TEXT, "STRING");
		var L_RCTEXT5_TEXT =  "目录项";
		oResHelper.AddResource("IDS_DBPROP_CATALOGTERM", L_RCTEXT5_TEXT, "STRING");
		var L_RCTEXT6_TEXT =  "目录用法";
		oResHelper.AddResource("IDS_DBPROP_CATALOGUSAGE", L_RCTEXT6_TEXT, "STRING");
		var L_RCTEXT7_TEXT =  "列定义";
		oResHelper.AddResource("IDS_DBPROP_COLUMNDEFINITION", L_RCTEXT7_TEXT, "STRING");
		var L_RCTEXT8_TEXT =  "null 串联行为";
		oResHelper.AddResource("IDS_DBPROP_CONCATNULLBEHAVIOR", L_RCTEXT8_TEXT, "STRING");
		var L_RCTEXT9_TEXT =  "数据源名称";
		oResHelper.AddResource("IDS_DBPROP_DATASOURCENAME", L_RCTEXT9_TEXT, "STRING");
		var L_RCTEXT10_TEXT =  "只读数据源";
		oResHelper.AddResource("IDS_DBPROP_DATASOURCEREADONLY", L_RCTEXT10_TEXT, "STRING");
		var L_RCTEXT11_TEXT =  "DBMS 名称";
		oResHelper.AddResource("IDS_DBPROP_DBMSNAME", L_RCTEXT11_TEXT, "STRING");
		var L_RCTEXT12_TEXT =  "DBMS 版本";
		oResHelper.AddResource("IDS_DBPROP_DBMSVER", L_RCTEXT12_TEXT, "STRING");
		var L_RCTEXT13_TEXT =  "过程项";
		oResHelper.AddResource("IDS_DBPROP_PROCEDURETERM", L_RCTEXT13_TEXT, "STRING");
		var L_RCTEXT14_TEXT =  "OLE DB 版本";
		oResHelper.AddResource("IDS_DBPROP_PROVIDEROLEDBVER", L_RCTEXT14_TEXT, "STRING");
		var L_RCTEXT15_TEXT =  "提供程序名称";
		oResHelper.AddResource("IDS_DBPROP_PROVIDERNAME", L_RCTEXT15_TEXT, "STRING");
		var L_RCTEXT16_TEXT =  "提供程序版本";
		oResHelper.AddResource("IDS_DBPROP_PROVIDERVER", L_RCTEXT16_TEXT, "STRING");
		var L_RCTEXT17_TEXT =  "被引用的标识符敏感度";
		oResHelper.AddResource("IDS_DBPROP_QUOTEDIDENTIFIERCASE", L_RCTEXT17_TEXT, "STRING");
		var L_RCTEXT18_TEXT =  "架构项";
		oResHelper.AddResource("IDS_DBPROP_SCHEMATERM", L_RCTEXT18_TEXT, "STRING");
		var L_RCTEXT19_TEXT =  "架构使用";
		oResHelper.AddResource("IDS_DBPROP_SCHEMAUSAGE", L_RCTEXT19_TEXT, "STRING");
		var L_RCTEXT20_TEXT =  "SQL 支持";
		oResHelper.AddResource("IDS_DBPROP_SQLSUPPORT", L_RCTEXT20_TEXT, "STRING");
		var L_RCTEXT21_TEXT =  "结构化存储";
		oResHelper.AddResource("IDS_DBPROP_STRUCTUREDSTORAGE", L_RCTEXT21_TEXT, "STRING");
		var L_RCTEXT22_TEXT =  "子查询支持";
		oResHelper.AddResource("IDS_DBPROP_SUBQUERIES", L_RCTEXT22_TEXT, "STRING");
		var L_RCTEXT23_TEXT =  "隔离级别";
		oResHelper.AddResource("IDS_DBPROP_SUPPORTEDTXNISOLEVELS", L_RCTEXT23_TEXT, "STRING");
		var L_RCTEXT24_TEXT =  "隔离保持";
		oResHelper.AddResource("IDS_DBPROP_SUPPORTEDTXNISORETAIN", L_RCTEXT24_TEXT, "STRING");
		var L_RCTEXT25_TEXT =     "表项";
		oResHelper.AddResource("IDS_DBPROP_TABLETERM", L_RCTEXT25_TEXT, "STRING");
		var L_RCTEXT26_TEXT =      "用户名";
		oResHelper.AddResource("IDS_DBPROP_USERNAME", L_RCTEXT26_TEXT, "STRING");
		var L_RCTEXT27_TEXT =  "事务 DDL";
		oResHelper.AddResource("IDS_DBPROP_SUPPORTEDTXNDDL", L_RCTEXT27_TEXT, "STRING");
		var L_RCTEXT28_TEXT =  "可异步中止";
		oResHelper.AddResource("IDS_DBPROP_ASYNCTXNABORT", L_RCTEXT28_TEXT, "STRING");
		var L_RCTEXT29_TEXT =  "数据源对象线程模型";
		oResHelper.AddResource("IDS_DBPROP_DSOTHREADMODEL", L_RCTEXT29_TEXT, "STRING");
		var L_RCTEXT30_TEXT =  "多参数集";
		oResHelper.AddResource("IDS_DBPROP_MULTIPLEPARAMSETS", L_RCTEXT30_TEXT, "STRING");
		var L_RCTEXT31_TEXT =  "输出参数可用性";
		oResHelper.AddResource("IDS_DBPROP_OUTPUTPARAMETERAVAILABILITY", L_RCTEXT31_TEXT, "STRING");
		var L_RCTEXT32_TEXT =  "持久性 ID 类型";
		oResHelper.AddResource("IDS_DBPROP_PERSISTENTIDTYPE", L_RCTEXT32_TEXT, "STRING");
		var L_RCTEXT33_TEXT =  "列设置通知";
		oResHelper.AddResource("IDS_DBPROP_NOTIFYCOLUMNSET", L_RCTEXT33_TEXT, "STRING");
		var L_RCTEXT34_TEXT =  "行删除通知";
		oResHelper.AddResource("IDS_DBPROP_NOTIFYROWDELETE", L_RCTEXT34_TEXT, "STRING");
		var L_RCTEXT35_TEXT =  "行首次更改通知";
		oResHelper.AddResource("IDS_DBPROP_NOTIFYROWFIRSTCHANGE", L_RCTEXT35_TEXT, "STRING");
		var L_RCTEXT36_TEXT =  "行插入通知";
		oResHelper.AddResource("IDS_DBPROP_NOTIFYROWINSERT", L_RCTEXT36_TEXT, "STRING");
		var L_RCTEXT37_TEXT =  "行重同步通知";
		oResHelper.AddResource("IDS_DBPROP_NOTIFYROWRESYNCH", L_RCTEXT37_TEXT, "STRING");
		var L_RCTEXT38_TEXT =  "行集合释放通知";
		oResHelper.AddResource("IDS_DBPROP_NOTIFYROWSETRELEASE", L_RCTEXT38_TEXT, "STRING");
		var L_RCTEXT39_TEXT =  "行集合提取位置更改通知";
		oResHelper.AddResource("IDS_DBPROP_NOTIFYROWSETFETCHPOSITIONCHANGE", L_RCTEXT39_TEXT, "STRING");
		var L_RCTEXT40_TEXT =  "行撤消更改通知";
		oResHelper.AddResource("IDS_DBPROP_NOTIFYROWUNDOCHANGE", L_RCTEXT40_TEXT, "STRING");
		var L_RCTEXT41_TEXT =  "行撤消删除通知";
		oResHelper.AddResource("IDS_DBPROP_NOTIFYROWUNDODELETE", L_RCTEXT41_TEXT, "STRING");
		var L_RCTEXT42_TEXT =       "GROUP BY 支持";
		oResHelper.AddResource("IDS_DBPROP_GROUPBY", L_RCTEXT42_TEXT, "STRING");
		var L_RCTEXT43_TEXT =  "异类表支持";
		oResHelper.AddResource("IDS_DBPROP_HETEROGENEOUSTABLES", L_RCTEXT43_TEXT, "STRING");
		var L_RCTEXT44_TEXT =  "标识符区分大小写";
		oResHelper.AddResource("IDS_DBPROP_IDENTIFIERCASE", L_RCTEXT44_TEXT, "STRING");
		var L_RCTEXT45_TEXT =     "锁定模式";
		oResHelper.AddResource("IDS_DBPROP_LOCKMODES", L_RCTEXT45_TEXT, "STRING");
		var L_RCTEXT46_TEXT =  "最大索引大小";
		oResHelper.AddResource("IDS_DBPROP_MAXINDEXSIZE", L_RCTEXT46_TEXT, "STRING");
		var L_RCTEXT47_TEXT =    "最大行大小";
		oResHelper.AddResource("IDS_DBPROP_MAXROWSIZE", L_RCTEXT47_TEXT, "STRING");
		var L_RCTEXT48_TEXT =  "最大行大小包含 BLOB";
		oResHelper.AddResource("IDS_DBPROP_MAXROWSIZEINCLUDESBLOB", L_RCTEXT48_TEXT, "STRING");
		var L_RCTEXT49_TEXT =  "SELECT 中的最大表数";
		oResHelper.AddResource("IDS_DBPROP_MAXTABLESINSELECT", L_RCTEXT49_TEXT, "STRING");
		var L_RCTEXT50_TEXT =  "多存储对象";
		oResHelper.AddResource("IDS_DBPROP_MULTIPLESTORAGEOBJECTS", L_RCTEXT50_TEXT, "STRING");
		var L_RCTEXT51_TEXT =  "多表更新";
		oResHelper.AddResource("IDS_DBPROP_MULTITABLEUPDATE", L_RCTEXT51_TEXT, "STRING");
		var L_RCTEXT52_TEXT =  "通知阶段";
		oResHelper.AddResource("IDS_DBPROP_NOTIFICATIONPHASES", L_RCTEXT52_TEXT, "STRING");
		var L_RCTEXT53_TEXT =  "null 排序顺序";
		oResHelper.AddResource("IDS_DBPROP_NULLCOLLATION", L_RCTEXT53_TEXT, "STRING");
		var L_RCTEXT54_TEXT =    "OLE 对象支持";
		oResHelper.AddResource("IDS_DBPROP_OLEOBJECTS", L_RCTEXT54_TEXT, "STRING");
		var L_RCTEXT55_TEXT =  "选择列表中的 ORDER BY 列";
		oResHelper.AddResource("IDS_DBPROP_ORDERBYCOLUMNSINSELECT", L_RCTEXT55_TEXT, "STRING");
		var L_RCTEXT56_TEXT =  "准备提交行为";
		oResHelper.AddResource("IDS_DBPROP_PREPARECOMMITBEHAVIOR", L_RCTEXT56_TEXT, "STRING");
		var L_RCTEXT57_TEXT =  "准备中止行为";
		oResHelper.AddResource("IDS_DBPROP_PREPAREABORTBEHAVIOR", L_RCTEXT57_TEXT, "STRING");
		var L_RCTEXT58_TEXT =  "行撤消插入通知";
		oResHelper.AddResource("IDS_DBPROP_NOTIFYROWUNDOINSERT", L_RCTEXT58_TEXT, "STRING");
		var L_RCTEXT59_TEXT =  "行更新通知";
		oResHelper.AddResource("IDS_DBPROP_NOTIFYROWUPDATE", L_RCTEXT59_TEXT, "STRING");
		var L_RCTEXT60_TEXT =  "按命令转换行集合";
		oResHelper.AddResource("IDS_DBPROP_ROWSETCONVERSIONSONCOMMAND", L_RCTEXT60_TEXT, "STRING");
		var L_RCTEXT61_TEXT =  "多个结果";
		oResHelper.AddResource("IDS_DBPROP_MULTIPLERESULTS", L_RCTEXT61_TEXT, "STRING");
		var L_RCTEXT62_TEXT =  "ISequentialStream";
		oResHelper.AddResource("IDS_DBPROP_ISequentialStream", L_RCTEXT62_TEXT, "STRING");
		var L_RCTEXT63_TEXT =  "中止时保留";
		oResHelper.AddResource("IDS_DBPROP_ABORTPRESERVE", L_RCTEXT63_TEXT, "STRING");
		var L_RCTEXT64_TEXT =  "模块化存储对象";
		oResHelper.AddResource("IDS_DBPROP_BLOCKINGSTORAGEOBJECTS", L_RCTEXT64_TEXT, "STRING");
		var L_RCTEXT65_TEXT =  "IRowsetScroll";
		oResHelper.AddResource("IDS_DBPROP_IRowsetScroll", L_RCTEXT65_TEXT, "STRING");
		var L_RCTEXT66_TEXT =  "IRowsetUpdate";
		oResHelper.AddResource("IDS_DBPROP_IRowsetUpdate", L_RCTEXT66_TEXT, "STRING");
		var L_RCTEXT67_TEXT =  "ISupportErrorInfo";
		oResHelper.AddResource("IDS_DBPROP_ISupportErrorInfo", L_RCTEXT67_TEXT, "STRING");
		var L_RCTEXT68_TEXT =  "更改插入的行";
		oResHelper.AddResource("IDS_DBPROP_CHANGEINSERTEDROWS", L_RCTEXT68_TEXT, "STRING");
		var L_RCTEXT69_TEXT =  "返回挂起的插入";
		oResHelper.AddResource("IDS_DBPROP_RETURNPENDINGINSERTS", L_RCTEXT69_TEXT, "STRING");
		var L_RCTEXT70_TEXT =  "IConvertType";
		oResHelper.AddResource("IDS_DBPROP_IConvertType", L_RCTEXT70_TEXT, "STRING");
		var L_RCTEXT71_TEXT =  "缓存身份验证";
		oResHelper.AddResource("IDS_DBPROP_AUTH_CACHE_AUTHINFO", L_RCTEXT71_TEXT, "STRING");
		var L_RCTEXT72_TEXT =  "对密码进行加密";
		oResHelper.AddResource("IDS_DBPROP_AUTH_ENCRYPT_PASSWORD", L_RCTEXT72_TEXT, "STRING");
		var L_RCTEXT73_TEXT =  "集成安全性";
		oResHelper.AddResource("IDS_DBPROP_AUTH_INTEGRATED", L_RCTEXT73_TEXT, "STRING");
		var L_RCTEXT74_TEXT =  "屏蔽密码";
		oResHelper.AddResource("IDS_DBPROP_AUTH_MASK_PASSWORD", L_RCTEXT74_TEXT, "STRING");
		var L_RCTEXT75_TEXT =  "密码";
		oResHelper.AddResource("IDS_DBPROP_AUTH_PASSWORD", L_RCTEXT75_TEXT, "STRING");
		var L_RCTEXT76_TEXT =  "持久性加密";
		oResHelper.AddResource("IDS_DBPROP_AUTH_PERSIST_ENCRYPTED", L_RCTEXT76_TEXT, "STRING");
		var L_RCTEXT77_TEXT =  "持久性安全信息";
		oResHelper.AddResource("IDS_DBPROP_AUTH_PERSIST_SENSITIVE_AUTHINFO", L_RCTEXT77_TEXT, "STRING");
		var L_RCTEXT78_TEXT =   "用户 ID";
		oResHelper.AddResource("IDS_DBPROP_AUTH_USERID", L_RCTEXT78_TEXT, "STRING");
		var L_RCTEXT79_TEXT =  "数据源";
		oResHelper.AddResource("IDS_DBPROP_INIT_DATASOURCE", L_RCTEXT79_TEXT, "STRING");
		var L_RCTEXT80_TEXT =     "窗口句柄";
		oResHelper.AddResource("IDS_DBPROP_INIT_HWND", L_RCTEXT80_TEXT, "STRING");
		var L_RCTEXT81_TEXT =  "模拟级别";
		oResHelper.AddResource("IDS_DBPROP_INIT_IMPERSONATION_LEVEL", L_RCTEXT81_TEXT, "STRING");
		var L_RCTEXT82_TEXT =  "位置";
		oResHelper.AddResource("IDS_DBPROP_INIT_LOCATION", L_RCTEXT82_TEXT, "STRING");
		var L_RCTEXT83_TEXT =     "模式";
		oResHelper.AddResource("IDS_DBPROP_INIT_MODE", L_RCTEXT83_TEXT, "STRING");
		var L_RCTEXT84_TEXT =   "提示";
		oResHelper.AddResource("IDS_DBPROP_INIT_PROMPT", L_RCTEXT84_TEXT, "STRING");
		var L_RCTEXT85_TEXT =  "保护级别";
		oResHelper.AddResource("IDS_DBPROP_INIT_PROTECTION_LEVEL", L_RCTEXT85_TEXT, "STRING");
		var L_RCTEXT86_TEXT =  "连接超时";
		oResHelper.AddResource("IDS_DBPROP_INIT_TIMEOUT", L_RCTEXT86_TEXT, "STRING");
		var L_RCTEXT87_TEXT =     "区域设置标识符";
		oResHelper.AddResource("IDS_DBPROP_INIT_LCID", L_RCTEXT87_TEXT, "STRING");
		var L_RCTEXT88_TEXT =  "扩展属性";
		oResHelper.AddResource("IDS_DBPROP_INIT_PROVIDERSTRING", L_RCTEXT88_TEXT, "STRING");
		var L_RCTEXT89_TEXT =  "自动提交隔离级别";
		oResHelper.AddResource("IDS_DBPROP_SESS_AUTOCOMMITISOLEVELS", L_RCTEXT89_TEXT, "STRING");
		var L_RCTEXT90_TEXT =  "服务器游标";
		oResHelper.AddResource("IDS_DBPROP_SERVERCURSOR", L_RCTEXT90_TEXT, "STRING");
		var L_RCTEXT91_TEXT =  "对象事务处理";
		oResHelper.AddResource("IDS_DBPROP_TRANSACTEDOBJECT", L_RCTEXT91_TEXT, "STRING");
		var L_RCTEXT92_TEXT =  "可更新性";
		oResHelper.AddResource("IDS_DBPROP_UPDATABILITY", L_RCTEXT92_TEXT, "STRING");
		var L_RCTEXT93_TEXT =  "强行标识";
		oResHelper.AddResource("IDS_DBPROP_STRONGIDENTITY", L_RCTEXT93_TEXT, "STRING");
		var L_RCTEXT94_TEXT =     "IAccessor";
		oResHelper.AddResource("IDS_DBPROP_IAccessor", L_RCTEXT94_TEXT, "STRING");
		var L_RCTEXT95_TEXT =  "IColumnsInfo";
		oResHelper.AddResource("IDS_DBPROP_IColumnsInfo", L_RCTEXT95_TEXT, "STRING");
		var L_RCTEXT96_TEXT =  "IColumnsRowset";
		oResHelper.AddResource("IDS_DBPROP_IColumnsRowset", L_RCTEXT96_TEXT, "STRING");
		var L_RCTEXT97_TEXT =  "IConnectionPointContainer";
		oResHelper.AddResource("IDS_DBPROP_IConnectionPointContainer", L_RCTEXT97_TEXT, "STRING");
		var L_RCTEXT98_TEXT =  "IProvideMoniker";
		oResHelper.AddResource("IDS_DBPROP_IProvideMoniker", L_RCTEXT98_TEXT, "STRING");
		var L_RCTEXT99_TEXT =       "IRowset";
		oResHelper.AddResource("IDS_DBPROP_IRowset", L_RCTEXT99_TEXT, "STRING");
		var L_RCTEXT100_TEXT =  "IRowsetChange";
		oResHelper.AddResource("IDS_DBPROP_IRowsetChange", L_RCTEXT100_TEXT, "STRING");
		var L_RCTEXT101_TEXT =  "IRowsetIdentity";
		oResHelper.AddResource("IDS_DBPROP_IRowsetIdentity", L_RCTEXT101_TEXT, "STRING");
		var L_RCTEXT102_TEXT =   "IRowsetInfo";
		oResHelper.AddResource("IDS_DBPROP_IRowsetInfo", L_RCTEXT102_TEXT, "STRING");
		var L_RCTEXT103_TEXT =  "IRowsetLocate";
		oResHelper.AddResource("IDS_DBPROP_IRowsetLocate", L_RCTEXT103_TEXT, "STRING");
		var L_RCTEXT104_TEXT =  "IRowsetResynch";
		oResHelper.AddResource("IDS_DBPROP_IRowsetResynch", L_RCTEXT104_TEXT, "STRING");
		var L_RCTEXT105_TEXT =     "使用书签";
		oResHelper.AddResource("IDS_DBPROP_BOOKMARKS", L_RCTEXT105_TEXT, "STRING");
		var L_RCTEXT106_TEXT =  "跳过删除的书签";
		oResHelper.AddResource("IDS_DBPROP_BOOKMARKSKIPPED", L_RCTEXT106_TEXT, "STRING");
		var L_RCTEXT107_TEXT =  "书签类型";
		oResHelper.AddResource("IDS_DBPROP_BOOKMARKTYPE", L_RCTEXT107_TEXT, "STRING");
		var L_RCTEXT108_TEXT =  "向后提取";
		oResHelper.AddResource("IDS_DBPROP_CANFETCHBACKWARDS", L_RCTEXT108_TEXT, "STRING");
		var L_RCTEXT109_TEXT =   "保留行";
		oResHelper.AddResource("IDS_DBPROP_CANHOLDROWS", L_RCTEXT109_TEXT, "STRING");
		var L_RCTEXT110_TEXT =    "仅限追加的行集合";
		oResHelper.AddResource("IDS_DBPROP_APPENDONLY", L_RCTEXT110_TEXT, "STRING");
		var L_RCTEXT111_TEXT =  "向后滚动";
		oResHelper.AddResource("IDS_DBPROP_CANSCROLLBACKWARDS", L_RCTEXT111_TEXT, "STRING");
		var L_RCTEXT112_TEXT =  "列特权";
		oResHelper.AddResource("IDS_DBPROP_COLUMNRESTRICT", L_RCTEXT112_TEXT, "STRING");
		var L_RCTEXT113_TEXT =  "命令超时";
		oResHelper.AddResource("IDS_DBPROP_COMMANDTIMEOUT", L_RCTEXT113_TEXT, "STRING");
		var L_RCTEXT114_TEXT =  "提交时保留";
		oResHelper.AddResource("IDS_DBPROP_COMMITPRESERVE", L_RCTEXT114_TEXT, "STRING");
		var L_RCTEXT115_TEXT =  "延迟存储对象更新";
		oResHelper.AddResource("IDS_DBPROP_DELAYSTORAGEOBJECTS", L_RCTEXT115_TEXT, "STRING");
		var L_RCTEXT116_TEXT =  "固定行";
		oResHelper.AddResource("IDS_DBPROP_IMMOBILEROWS", L_RCTEXT116_TEXT, "STRING");
		var L_RCTEXT117_TEXT =  "书签";
		oResHelper.AddResource("IDS_DBPROP_LITERALBOOKMARKS", L_RCTEXT117_TEXT, "STRING");
		var L_RCTEXT118_TEXT =  "行标识";
		oResHelper.AddResource("IDS_DBPROP_LITERALIDENTITY", L_RCTEXT118_TEXT, "STRING");
		var L_RCTEXT119_TEXT =   "最大打开行数";
		oResHelper.AddResource("IDS_DBPROP_MAXOPENROWS", L_RCTEXT119_TEXT, "STRING");
		var L_RCTEXT120_TEXT =  "最大挂起行数";
		oResHelper.AddResource("IDS_DBPROP_MAXPENDINGROWS", L_RCTEXT120_TEXT, "STRING");
		var L_RCTEXT121_TEXT =       "最大行数";
		oResHelper.AddResource("IDS_DBPROP_MAXROWS", L_RCTEXT121_TEXT, "STRING");
		var L_RCTEXT122_TEXT =   "其他可见插入";
		oResHelper.AddResource("IDS_DBPROP_OTHERINSERT", L_RCTEXT122_TEXT, "STRING");
		var L_RCTEXT123_TEXT =  "其他可见更改";
		oResHelper.AddResource("IDS_DBPROP_OTHERUPDATEDELETE", L_RCTEXT123_TEXT, "STRING");
		var L_RCTEXT124_TEXT =     "自己的可见插入";
		oResHelper.AddResource("IDS_DBPROP_OWNINSERT", L_RCTEXT124_TEXT, "STRING");
		var L_RCTEXT125_TEXT =  "自己的可见更改";
		oResHelper.AddResource("IDS_DBPROP_OWNUPDATEDELETE", L_RCTEXT125_TEXT, "STRING");
		var L_RCTEXT126_TEXT =  "快速重新启动";
		oResHelper.AddResource("IDS_DBPROP_QUICKRESTART", L_RCTEXT126_TEXT, "STRING");
		var L_RCTEXT127_TEXT =  "可重入事件";
		oResHelper.AddResource("IDS_DBPROP_REENTRANTEVENTS", L_RCTEXT127_TEXT, "STRING");
		var L_RCTEXT128_TEXT =  "移除删除的行";
		oResHelper.AddResource("IDS_DBPROP_REMOVEDELETED", L_RCTEXT128_TEXT, "STRING");
		var L_RCTEXT129_TEXT =  "报告多个更改";
		oResHelper.AddResource("IDS_DBPROP_REPORTMULTIPLECHANGES", L_RCTEXT129_TEXT, "STRING");
		var L_RCTEXT130_TEXT =   "行特权";
		oResHelper.AddResource("IDS_DBPROP_ROWRESTRICT", L_RCTEXT130_TEXT, "STRING");
		var L_RCTEXT131_TEXT =  "行线程模型";
		oResHelper.AddResource("IDS_DBPROP_ROWTHREADMODEL", L_RCTEXT131_TEXT, "STRING");
		var L_RCTEXT132_TEXT =  "书签已排序";
		oResHelper.AddResource("IDS_DBPROP_ORDEREDBOOKMARKS", L_RCTEXT132_TEXT, "STRING");
		var L_RCTEXT133_TEXT =  "通知间隔";
		oResHelper.AddResource("IDS_DBPROP_NOTIFICATIONGRANULARITY", L_RCTEXT133_TEXT, "STRING");
		// 1.5 properties
		var L_RCTEXT134_TEXT =  "筛选操作";
		oResHelper.AddResource("IDS_DBPROP_FILTERCOMPAREOPS", L_RCTEXT134_TEXT, "STRING");
		var L_RCTEXT135_TEXT =  "查找操作";
		oResHelper.AddResource("IDS_DBPROP_FINDCOMPAREOPS", L_RCTEXT135_TEXT, "STRING");
		var L_RCTEXT136_TEXT =  "IChapteredRowset";
		oResHelper.AddResource("IDS_DBPROP_IChapteredRowset", L_RCTEXT136_TEXT, "STRING");
		var L_RCTEXT137_TEXT =  "IDBAsynchStatus";
		oResHelper.AddResource("IDS_DBPROP_IDBAsynchStatus", L_RCTEXT137_TEXT, "STRING");
		var L_RCTEXT138_TEXT =  "IRowsetFind";
		oResHelper.AddResource("IDS_DBPROP_IRowsetFind", L_RCTEXT138_TEXT, "STRING");
		var L_RCTEXT139_TEXT =  "IRowsetView";
		oResHelper.AddResource("IDS_DBPROP_IRowsetView", L_RCTEXT139_TEXT, "STRING");
		var L_RCTEXT140_TEXT =  "IViewChapter";
		oResHelper.AddResource("IDS_DBPROP_IViewChapter", L_RCTEXT140_TEXT, "STRING");
		var L_RCTEXT141_TEXT =  "IViewFilter";
		oResHelper.AddResource("IDS_DBPROP_IViewFilter", L_RCTEXT141_TEXT, "STRING");
		var L_RCTEXT142_TEXT =  "IViewRowset";
		oResHelper.AddResource("IDS_DBPROP_IViewRowset", L_RCTEXT142_TEXT, "STRING");
		var L_RCTEXT143_TEXT =  "IViewSort";
		oResHelper.AddResource("IDS_DBPROP_IViewSort", L_RCTEXT143_TEXT, "STRING");
		var L_RCTEXT144_TEXT =  "异步处理";
		oResHelper.AddResource("IDS_DBPROP_INIT_ASYNCH", L_RCTEXT144_TEXT, "STRING");
		var L_RCTEXT145_TEXT =  "最大打开章节数";
		oResHelper.AddResource("IDS_DBPROP_MAXOPENCHAPTERS", L_RCTEXT145_TEXT, "STRING");
		var L_RCTEXT146_TEXT =  "最大 OR 条件数";
		oResHelper.AddResource("IDS_DBPROP_MAXORSINFILTER", L_RCTEXT146_TEXT, "STRING");
		var L_RCTEXT147_TEXT =  "最大排序列数";
		oResHelper.AddResource("IDS_DBPROP_MAXSORTCOLUMNS", L_RCTEXT147_TEXT, "STRING");
		var L_RCTEXT148_TEXT =  "异步行集合处理";
		oResHelper.AddResource("IDS_DBPROP_ROWSET_ASYNCH", L_RCTEXT148_TEXT, "STRING");
		var L_RCTEXT149_TEXT =  "按索引排序";
		oResHelper.AddResource("IDS_DBPROP_SORTONINDEX", L_RCTEXT149_TEXT, "STRING");
		// 2.0 properties
		var L_RCTEXT150_TEXT =  "IMultipleResults";
		oResHelper.AddResource("IDS_DBPROP_IMultipleResults", L_RCTEXT150_TEXT, "STRING");
		var L_RCTEXT151_TEXT =  "数据源类型";
		oResHelper.AddResource("IDS_DBPROP_DATASOURCE_TYPE", L_RCTEXT151_TEXT, "STRING");
//MDPROP
		var L_RCTEXT152_TEXT =  "数据集中的轴数";
		oResHelper.AddResource("IDS_MDPROP_AXES", L_RCTEXT152_TEXT, "STRING");
		var L_RCTEXT153_TEXT =  "修整支持";
		oResHelper.AddResource("IDS_MDPROP_FLATTENING_SUPPORT", L_RCTEXT153_TEXT, "STRING");
		var L_RCTEXT154_TEXT =  "对联接多个多维数据集的查询的支持";
		oResHelper.AddResource("IDS_MDPROP_MDX_JOINCUBES", L_RCTEXT154_TEXT, "STRING");
		var L_RCTEXT155_TEXT =  "对命名级别的支持";
		oResHelper.AddResource("IDS_MDPROP_NAMED_LEVELS", L_RCTEXT155_TEXT, "STRING");
		//
		var L_RCTEXT156_TEXT =  "RANGEROWSET";
		oResHelper.AddResource("IDS_MDPROP_RANGEROWSET", L_RCTEXT156_TEXT, "STRING");
		var L_RCTEXT157_TEXT =  "MDX 语句的 WHERE 子句中的功能";
		oResHelper.AddResource("IDS_MDPROP_MDX_SLICER", L_RCTEXT157_TEXT, "STRING");
		//
		var L_RCTEXT158_TEXT =  "MDX_CUBEQUALIFICATION";
		oResHelper.AddResource("IDS_MDPROP_MDX_CUBEQUALIFICATION", L_RCTEXT158_TEXT, "STRING");
		var L_RCTEXT159_TEXT =  "对 MDX 语句中的外部引用的支持";
		oResHelper.AddResource("IDS_MDPROP_MDX_OUTERREFERENCE", L_RCTEXT159_TEXT, "STRING");
		var L_RCTEXT160_TEXT =  "对 MDX 语句中按属性值查询的支持";
		oResHelper.AddResource("IDS_MDPROP_MDX_QUERYBYPROPERTY", L_RCTEXT160_TEXT, "STRING");
		var L_RCTEXT161_TEXT =  "对 MDX case 语句的支持";
		oResHelper.AddResource("IDS_MDPROP_MDX_CASESUPPORT", L_RCTEXT161_TEXT, "STRING");
		var L_RCTEXT162_TEXT =  "对除等于和不等于运算符之外的字符串比较运算符的支持";
		oResHelper.AddResource("IDS_MDPROP_MDX_STRING_COMPOP", L_RCTEXT162_TEXT, "STRING");
		var L_RCTEXT163_TEXT =  "对 DESCENDANTS 函数中的各种 <desc flag> 值的支持";
		oResHelper.AddResource("IDS_MDPROP_MDX_DESCFLAGS", L_RCTEXT163_TEXT, "STRING");
		var L_RCTEXT164_TEXT =  "对各种 set 函数的支持";
		oResHelper.AddResource("IDS_MDPROP_MDX_SET_FUNCTIONS", L_RCTEXT164_TEXT, "STRING");
		var L_RCTEXT165_TEXT =  "对各种成员函数的支持";
		oResHelper.AddResource("IDS_MDPROP_MDX_MEMBER_FUNCTIONS", L_RCTEXT165_TEXT, "STRING");
		var L_RCTEXT166_TEXT =  "对各种数字函数的支持";
		oResHelper.AddResource("IDS_MDPROP_MDX_NUMERIC_FUNCTIONS", L_RCTEXT166_TEXT, "STRING");
		var L_RCTEXT167_TEXT =  "对创建命名集和计算的成员的支持";
		oResHelper.AddResource("IDS_MDPROP_MDX_FORMULAS", L_RCTEXT167_TEXT, "STRING");
		var L_RCTEXT168_TEXT =  "对更新聚集单元格的支持";
		oResHelper.AddResource("IDS_MDPROP_AGGREGATECELL_UPDATE", L_RCTEXT168_TEXT, "STRING");
		//
		var L_RCTEXT169_TEXT =  "MDX_AGGREGATECELL_UPDATE";
		oResHelper.AddResource("IDS_MDPROP_MDX_AGGREGATECELL_UPDATE", L_RCTEXT169_TEXT, "STRING");
		var L_RCTEXT170_TEXT =  "提供程序限定多维数据集名称的能力";
		oResHelper.AddResource("IDS_MDPROP_MDX_OBJQUALIFICATION", L_RCTEXT170_TEXT, "STRING");
		var L_RCTEXT171_TEXT =  "set 函数的 <numeric_value_expression> 参数中的功能";
		oResHelper.AddResource("IDS_MDPROP_MDX_NONMEASURE_EXPRESSONS", L_RCTEXT171_TEXT, "STRING");
// DBPROP
		var L_RCTEXT172_TEXT =  "访问顺序";
		oResHelper.AddResource("IDS_DBPROP_ACCESSORDER", L_RCTEXT172_TEXT, "STRING");
		var L_RCTEXT173_TEXT =  "书签信息";
		oResHelper.AddResource("IDS_DBPROP_BOOKMARKINFO", L_RCTEXT173_TEXT, "STRING");
		var L_RCTEXT174_TEXT =  "初始目录";
		oResHelper.AddResource("IDS_DBPROP_INIT_CATALOG", L_RCTEXT174_TEXT, "STRING");
		var L_RCTEXT175_TEXT =  "批量操作";
		oResHelper.AddResource("IDS_DBPROP_ROW_BULKOPS", L_RCTEXT175_TEXT, "STRING");
		var L_RCTEXT176_TEXT =  "提供程序友好名称";
		oResHelper.AddResource("IDS_DBPROP_PROVIDERFRIENDLYNAME", L_RCTEXT176_TEXT, "STRING");
		var L_RCTEXT177_TEXT =  "锁定模式";
		oResHelper.AddResource("IDS_DBPROP_LOCKMODE", L_RCTEXT177_TEXT, "STRING");
		var L_RCTEXT178_TEXT =  "多个连接";
		oResHelper.AddResource("IDS_DBPROP_MULTIPLECONNECTIONS", L_RCTEXT178_TEXT, "STRING");
		var L_RCTEXT179_TEXT =  "唯一行";
		oResHelper.AddResource("IDS_DBPROP_UNIQUEROWS", L_RCTEXT179_TEXT, "STRING");
		var L_RCTEXT180_TEXT =  "插入时的服务器数据";
		oResHelper.AddResource("IDS_DBPROP_SERVERDATAONINSERT", L_RCTEXT180_TEXT, "STRING");
		//
		var L_RCTEXT181_TEXT =  "STORAGEFLAGS";
		oResHelper.AddResource("IDS_DBPROP_STORAGEFLAGS", L_RCTEXT181_TEXT, "STRING");
		var L_RCTEXT182_TEXT =  "连接状态";
		oResHelper.AddResource("IDS_DBPROP_CONNECTIONSTATUS", L_RCTEXT182_TEXT, "STRING");
		var L_RCTEXT183_TEXT =  "改变列支持";
		oResHelper.AddResource("IDS_DBPROP_ALTERCOLUMN", L_RCTEXT183_TEXT, "STRING");
		var L_RCTEXT184_TEXT =  "列 LCID";
		oResHelper.AddResource("IDS_DBPROP_COLUMNLCID", L_RCTEXT184_TEXT, "STRING");
		var L_RCTEXT185_TEXT =  "重置数据源";
		oResHelper.AddResource("IDS_DBPROP_RESETDATASOURCE", L_RCTEXT185_TEXT, "STRING");
		var L_RCTEXT186_TEXT =  "OLE DB 服务";
		oResHelper.AddResource("IDS_DBPROP_INIT_OLEDBSERVICES", L_RCTEXT186_TEXT, "STRING");
		var L_RCTEXT187_TEXT =  "IRowsetRefresh";
		oResHelper.AddResource("IDS_DBPROP_IRowsetRefresh", L_RCTEXT187_TEXT, "STRING");
		var L_RCTEXT188_TEXT =  "服务器名";
		oResHelper.AddResource("IDS_DBPROP_SERVERNAME", L_RCTEXT188_TEXT, "STRING");
		var L_RCTEXT189_TEXT =  "IParentRowset";
		oResHelper.AddResource("IDS_DBPROP_IParentRowset", L_RCTEXT189_TEXT, "STRING");
		var L_RCTEXT190_TEXT =  "隐藏列计数";
		oResHelper.AddResource("IDS_DBPROP_HIDDENCOLUMNS", L_RCTEXT190_TEXT, "STRING");
		var L_RCTEXT191_TEXT =  "提供程序拥有的内存";
		oResHelper.AddResource("IDS_DBPROP_PROVIDERMEMORY", L_RCTEXT191_TEXT, "STRING");
		var L_RCTEXT192_TEXT =  "客户端游标";
		oResHelper.AddResource("IDS_DBPROP_CLIENTCURSOR", L_RCTEXT192_TEXT, "STRING");
		// 2.1 properties
		var L_RCTEXT193_TEXT =  "受信者用户名";
		oResHelper.AddResource("IDS_DBPROP_TRUSTEE_USERNAME", L_RCTEXT193_TEXT, "STRING");
		var L_RCTEXT194_TEXT =  "身份验证字符串";
		oResHelper.AddResource("IDS_DBPROP_TRUSTEE_AUTHENTICATION", L_RCTEXT194_TEXT, "STRING");
		var L_RCTEXT195_TEXT =  "新的身份验证字符串";
		oResHelper.AddResource("IDS_DBPROP_TRUSTEE_NEWAUTHENTICATION", L_RCTEXT195_TEXT, "STRING");
		var L_RCTEXT196_TEXT =  "IRow";
		oResHelper.AddResource("IDS_DBPROP_IRow", L_RCTEXT196_TEXT, "STRING");
		var L_RCTEXT197_TEXT =  "IRowChange";
		oResHelper.AddResource("IDS_DBPROP_IRowChange", L_RCTEXT197_TEXT, "STRING");
		var L_RCTEXT198_TEXT =  "IRowSchemaChange";
		oResHelper.AddResource("IDS_DBPROP_IRowSchemaChange", L_RCTEXT198_TEXT, "STRING");
		var L_RCTEXT199_TEXT =  "IGetRow";
		oResHelper.AddResource("IDS_DBPROP_IGetRow", L_RCTEXT199_TEXT, "STRING");
		var L_RCTEXT200_TEXT =  "IScopedOperations";
		oResHelper.AddResource("IDS_DBPROP_IScopedOperations", L_RCTEXT200_TEXT, "STRING");
		var L_RCTEXT201_TEXT =  "IBindResource";
		oResHelper.AddResource("IDS_DBPROP_IBindResource", L_RCTEXT201_TEXT, "STRING");
		var L_RCTEXT202_TEXT =  "ICreateRow";
		oResHelper.AddResource("IDS_DBPROP_ICreateRow", L_RCTEXT202_TEXT, "STRING");
		var L_RCTEXT203_TEXT =  "绑定标志";
		oResHelper.AddResource("IDS_DBPROP_INIT_BINDFLAGS", L_RCTEXT203_TEXT, "STRING");
		var L_RCTEXT204_TEXT =  "锁定所有者";
		oResHelper.AddResource("IDS_DBPROP_INIT_LOCKOWNER", L_RCTEXT204_TEXT, "STRING");
		var L_RCTEXT205_TEXT =  "URL 生成";
		oResHelper.AddResource("IDS_DBPROP_GENERATEURL", L_RCTEXT205_TEXT, "STRING");
		//
		var L_RCTEXT206_TEXT =  "IDBBinderProperties";
		oResHelper.AddResource("IDS_DBPROP_IDBBinderProperties", L_RCTEXT206_TEXT, "STRING");
		var L_RCTEXT207_TEXT =  "IColumnsInfo2";
		oResHelper.AddResource("IDS_DBPROP_IColumnsInfo2", L_RCTEXT207_TEXT, "STRING");
		//
		var L_RCTEXT208_TEXT =  "IRegisterProvider";
		oResHelper.AddResource("IDS_DBPROP_IRegisterProvider", L_RCTEXT208_TEXT, "STRING");
		var L_RCTEXT209_TEXT =  "IGetSession";
		oResHelper.AddResource("IDS_DBPROP_IGetSession", L_RCTEXT209_TEXT, "STRING");
		var L_RCTEXT210_TEXT =  "IGetSourceRow";
		oResHelper.AddResource("IDS_DBPROP_IGetSourceRow", L_RCTEXT210_TEXT, "STRING");
		var L_RCTEXT211_TEXT =  "IRowsetCurrentIndex";
		oResHelper.AddResource("IDS_DBPROP_IRowsetCurrentIndex", L_RCTEXT211_TEXT, "STRING");
		var L_RCTEXT212_TEXT =  "打开行集合支持";
		oResHelper.AddResource("IDS_DBPROP_OPENROWSETSUPPORT", L_RCTEXT212_TEXT, "STRING");
		var L_RCTEXT213_TEXT =  "Is Long";
		oResHelper.AddResource("IDS_DBPROP_COL_ISLONG", L_RCTEXT213_TEXT, "STRING");
		// 2.5 properties
		var L_RCTEXT214_TEXT =  "种子";
		oResHelper.AddResource("IDS_DBPROP_COL_SEED", L_RCTEXT214_TEXT, "STRING");
		var L_RCTEXT215_TEXT =  "递增";
		oResHelper.AddResource("IDS_DBPROP_COL_INCREMENT", L_RCTEXT215_TEXT, "STRING");
		var L_RCTEXT216_TEXT =  "常规超时";
		oResHelper.AddResource("IDS_DBPROP_INIT_GENERALTIMEOUT", L_RCTEXT216_TEXT, "STRING");
		var L_RCTEXT217_TEXT =  "COM 服务支持";
		oResHelper.AddResource("IDS_DBPROP_COMSERVICES", L_RCTEXT217_TEXT, "STRING");
		// 2.6 properties
		var L_RCTEXT218_TEXT =  "输出流";
		oResHelper.AddResource("IDS_DBPROP_OUTPUTSTREAM", L_RCTEXT218_TEXT, "STRING");
		var L_RCTEXT219_TEXT =  "输出编码";
		oResHelper.AddResource("IDS_DBPROP_OUTPUTENCODING", L_RCTEXT219_TEXT, "STRING");
		var L_RCTEXT220_TEXT =  "表统计支持";
		oResHelper.AddResource("IDS_DBPROP_TABLESTATISTICS", L_RCTEXT220_TEXT, "STRING");
		var L_RCTEXT221_TEXT =  "跳过行计数结果";
		oResHelper.AddResource("IDS_DBPROP_SKIPROWCOUNTRESULTS", L_RCTEXT221_TEXT, "STRING");
		var L_RCTEXT222_TEXT =  "IRowsetBookmark";
		oResHelper.AddResource("IDS_DBPROP_IRowsetBookmark", L_RCTEXT222_TEXT, "STRING");
//MDPROP
		var L_RCTEXT223_TEXT =  "定义预先计算的总数的可见性";
		oResHelper.AddResource("IDS_MDPROP_VISUALMODE", L_RCTEXT223_TEXT, "STRING");

		if (!bAttributed)
		{
			var MidlTool = GetIDLConfig(selProj,true);
			var strMidlHeader = MidlTool.HeaderFileName;
			strMidlHeader = selProj.Object.Configurations(1).Evaluate(strMidlHeader);
			wizard.AddSymbol("MIDL_H_FILENAME",strMidlHeader);

			// Get LibID
			wizard.AddSymbol("LIBID_REGISTRY_FORMAT", oCM.IDLLibraries(1).Attributes.Find("uuid").Value);

			// Get typelib version
			var oVersion = oCM.IDLLibraries(1).Attributes.Find("version");
			if (oVersion)
			{
				var aryMajorMinor = oVersion.Value.split('.');
				for (var nCntr=0; nCntr<aryMajorMinor.length; nCntr++)
				{
					if (nCntr == 0)
						wizard.AddSymbol("TYPELIB_VERSION_MAJOR", aryMajorMinor[nCntr]);
					else
						wizard.AddSymbol("TYPELIB_VERSION_MINOR", aryMajorMinor[nCntr]);
				}
			}

			// Get AppID
			var strAppID = wizard.GetAppID();
			if (strAppID.length > 0)
			{
				wizard.AddSymbol("APPID_EXIST", true);
				wizard.AddSymbol("APPID_REGISTRY_FORMAT", strAppID);
			}

			// add RGS file resource
			strRGSFile = GetUniqueFileName(strProjectPath, CreateASCIIName(strShortName) + ".rgs");
			var strRGSID = "IDR_" + strUpperShortName;
			RenderAddTemplate(wizard, "provider.rgs", strRGSFile, false, false);
			var strSymbolValue = oResHelper.AddResource(strRGSID, strProjectPath + strRGSFile, "REGISTRY");
			wizard.AddSymbol("RGS_ID", strSymbolValue.split("=").shift());
	
			// Render provco.idl and insert into strProject.idl
			AddCoclassFromFile(oCM, "provco.idl");
		}
		oResHelper.CloseResourceFile();

		// Add #include <atldb.h> to pchFile, if any
		var nTotal = selProj.Object.Configurations.Count;
		var nCntr;
		var pchFile = "";
		for (nCntr = 1; nCntr <= nTotal; nCntr++)
		{
			var VCCLTool = selProj.Object.Configurations(nCntr).Tools("VCCLCompilerTool");
			if(VCCLTool.UsePrecompiledHeader == pchUseUsingSpecific)
			{
				if(pchFile=="")
					pchFile = VCCLTool.PrecompiledHeaderThrough;
			}
			if(pchFile!="")
			{
				if (!DoesIncludeExist(selProj, "<atldb.h>", pchFile))
					oCM.AddInclude("<atldb.h>", pchFile, vsCMAddPositionEnd);
				break;
			}
		}

		// Add header
		var strTemplatePath	= wizard.FindSymbol("TEMPLATES_PATH");
		if ("\\" != strTemplatePath.charAt(strTemplatePath.length-1))
			strTemplatePath += "\\";

		wizard.RenderTemplate(strTemplatePath + "prowset.h", strRowsetHeader);
		wizard.RenderTemplate(strTemplatePath + "psession.h", strSessionHeader);
		wizard.RenderTemplate(strTemplatePath + "pdatasrc.h", strDataSourceHeader);

		AddFileToProject(strRowsetHeader, selObj, true);
		AddFileToProject(strSessionHeader, selObj, false);
		AddFileToProject(strDataSourceHeader, selObj, false);

		// Add CPP
		RenderAddTemplate(wizard, "prowset.cpp", strRowsetImpl, selObj, false);
		
		oCM.CommitTransaction();
	}
	catch(e)
	{
		if (oCM)
			oCM.AbortTransaction();

		if (e.description.length != 0)
			SetErrorInfo(e);
		return e.number
	}
}

function CreateGUIDs()
{
	try
	{
		// create CLSID
		var strRawGUID = wizard.CreateGuid();
		var strFormattedGUID = wizard.FormatGuid(strRawGUID, 0);
		wizard.AddSymbol("CLSID_REGISTRY_FORMAT", strFormattedGUID);

		strRawGUID = wizard.CreateGuid();
		strFormattedGUID = wizard.FormatGuid(strRawGUID, 0);
		wizard.AddSymbol("CLSID_COMMAND_REGISTRY_FORMAT", strFormattedGUID);

		strRawGUID = wizard.CreateGuid();
		strFormattedGUID = wizard.FormatGuid(strRawGUID, 0);
		wizard.AddSymbol("CLSID_SESSION_REGISTRY_FORMAT", strFormattedGUID);
	}
	catch(e)
	{
		throw e;
	}
}

// SIG // Begin signature block
// SIG // MIIa6AYJKoZIhvcNAQcCoIIa2TCCGtUCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFPhDbPsuSy5j
// SIG // aEo6ns496Tpd206loIIVgjCCBMMwggOroAMCAQICEzMA
// SIG // AACsYxbn40ZVsxwAAAAAAKwwDQYJKoZIhvcNAQEFBQAw
// SIG // dzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBMB4XDTE2MDUwMzE3
// SIG // MTMyM1oXDTE3MDgwMzE3MTMyM1owgbMxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xDTALBgNVBAsTBE1PUFIxJzAlBgNVBAsT
// SIG // Hm5DaXBoZXIgRFNFIEVTTjpDMEY0LTMwODYtREVGODEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
// SIG // ggEBAJ8h3YTccknLV/hvi0hiAhANf1YT1ZtfcdeBRgUA
// SIG // lKkNQEzmvMz9WRplOiTlI/ECx5uEgMJSr6LBi/KNN1XK
// SIG // QjbDftNeYzF24YT+8DE2aQA05eRMPO+nUqoCkcRLbmh4
// SIG // +LCbt1tX4SfWKpsHqflc+fo3FEFdiGSwcONZpljGhi2o
// SIG // aWi27pflzme8Itvqn06z1WKQd74VTMGqSxJDN9obDlH5
// SIG // fqGb7gH0cDwRcWPxptJ2XE2wddo0q/EKwRe8n9Xv9yko
// SIG // qpXnItxm0mU/PeiznK+235uZzV/HxFqMOlmVgayOiyj8
// SIG // fbd3HsuLc9KQHXV9jeiwErd0NB4Ozf87IDmL65cCAwEA
// SIG // AaOCAQkwggEFMB0GA1UdDgQWBBQhVywB7YNQaGndwU1p
// SIG // q42rT5Q3YjAfBgNVHSMEGDAWgBQjNPjZUkZwCu1A+3b7
// SIG // syuwwzWzDzBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0
// SIG // cy9NaWNyb3NvZnRUaW1lU3RhbXBQQ0EuY3JsMFgGCCsG
// SIG // AQUFBwEBBEwwSjBIBggrBgEFBQcwAoY8aHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3Nv
// SIG // ZnRUaW1lU3RhbXBQQ0EuY3J0MBMGA1UdJQQMMAoGCCsG
// SIG // AQUFBwMIMA0GCSqGSIb3DQEBBQUAA4IBAQBGNopaApng
// SIG // TXZuCD1daUIu3+BLDZqLVDHp+Q/A4OKzixPSZHdJTTi+
// SIG // XIZlivnfQSxuUqrD9Ef4KqYeIRxWTOC1R1K0sUHEC1gR
// SIG // In6zNgXjdBumKUYhge550KqvOvjcF/daS4SeSwcyaPhL
// SIG // nFhShZhAVyzAS/OX8grrApNEaMHR6aoebN84ZDIIxV/n
// SIG // F1syV1C3xnxD7wlwyiIMbHOZFGpWInv5pAim6VlxFuoD
// SIG // fhTTyk274x3AsbXH/ZlXqpQOY6ExXviWzMoLTk3l9DJX
// SIG // +K07wq395ANM7ESS/8uSXYoXcUj/Jyl+R9ENglpgw2Ps
// SIG // b28fbS3qrP2xE6WjM+yv/wH+MIIE7DCCA9SgAwIBAgIT
// SIG // MwAAAQosea7XeXumrAABAAABCjANBgkqhkiG9w0BAQUF
// SIG // ADB5MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSMwIQYDVQQDExpN
// SIG // aWNyb3NvZnQgQ29kZSBTaWduaW5nIFBDQTAeFw0xNTA2
// SIG // MDQxNzQyNDVaFw0xNjA5MDQxNzQyNDVaMIGDMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMQ0wCwYDVQQLEwRNT1BSMR4wHAYD
// SIG // VQQDExVNaWNyb3NvZnQgQ29ycG9yYXRpb24wggEiMA0G
// SIG // CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCS/G82u+ED
// SIG // uSjWRtGiYbqlRvtjFj4u+UfSx+ztx5mxJlF1vdrMDwYU
// SIG // EaRsGZ7AX01UieRNUNiNzaFhpXcTmhyn7Q1096dWeego
// SIG // 91PSsXpj4PWUl7fs2Uf4bD3zJYizvArFBKeOfIVIdhxh
// SIG // RqoZxHpii8HCNar7WG/FYwuTSTCBG3vff3xPtEdtX3gc
// SIG // r7b3lhNS77nRTTnlc95ITjwUqpcNOcyLUeFc0Tvwjmfq
// SIG // MGCpTVqdQ73bI7rAD9dLEJ2cTfBRooSq5JynPdaj7woY
// SIG // SKj6sU6lmA5Lv/AU8wDIsEjWW/4414kRLQW6QwJPIgCW
// SIG // Ja19NW6EaKsgGDgo/hyiELGlAgMBAAGjggFgMIIBXDAT
// SIG // BgNVHSUEDDAKBggrBgEFBQcDAzAdBgNVHQ4EFgQUif4K
// SIG // MeomzeZtx5GRuZSMohhhNzQwUQYDVR0RBEowSKRGMEQx
// SIG // DTALBgNVBAsTBE1PUFIxMzAxBgNVBAUTKjMxNTk1KzA0
// SIG // MDc5MzUwLTE2ZmEtNGM2MC1iNmJmLTlkMmIxY2QwNTk4
// SIG // NDAfBgNVHSMEGDAWgBTLEejK0rQWWAHJNy4zFha5TJoK
// SIG // HzBWBgNVHR8ETzBNMEugSaBHhkVodHRwOi8vY3JsLm1p
// SIG // Y3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9NaWND
// SIG // b2RTaWdQQ0FfMDgtMzEtMjAxMC5jcmwwWgYIKwYBBQUH
// SIG // AQEETjBMMEoGCCsGAQUFBzAChj5odHRwOi8vd3d3Lm1p
// SIG // Y3Jvc29mdC5jb20vcGtpL2NlcnRzL01pY0NvZFNpZ1BD
// SIG // QV8wOC0zMS0yMDEwLmNydDANBgkqhkiG9w0BAQUFAAOC
// SIG // AQEApqhTkd87Af5hXQZa62bwDNj32YTTAFEOENGk0Rco
// SIG // 54wzOCvYQ8YDi3XrM5L0qeJn/QLbpR1OQ0VdG0nj4E8W
// SIG // 8H6P8IgRyoKtpPumqV/1l2DIe8S/fJtp7R+CwfHNjnhL
// SIG // YvXXDRzXUxLWllLvNb0ZjqBAk6EKpS0WnMJGdAjr2/TY
// SIG // pUk2VBIRVQOzexb7R/77aPzARVziPxJ5M6LvgsXeQBkH
// SIG // 7hXFCptZBUGp0JeegZ4DW/xK4xouBaxQRy+M+nnYHiD4
// SIG // BfspaxgU+nIEtwunmmTsEV1PRUmNKRot+9C2CVNfNJTg
// SIG // FsS56nM16Ffv4esWwxjHBrM7z2GE4rZEiZSjhjCCBbww
// SIG // ggOkoAMCAQICCmEzJhoAAAAAADEwDQYJKoZIhvcNAQEF
// SIG // BQAwXzETMBEGCgmSJomT8ixkARkWA2NvbTEZMBcGCgmS
// SIG // JomT8ixkARkWCW1pY3Jvc29mdDEtMCsGA1UEAxMkTWlj
// SIG // cm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
// SIG // MB4XDTEwMDgzMTIyMTkzMloXDTIwMDgzMTIyMjkzMlow
// SIG // eTELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEjMCEGA1UEAxMaTWlj
// SIG // cm9zb2Z0IENvZGUgU2lnbmluZyBQQ0EwggEiMA0GCSqG
// SIG // SIb3DQEBAQUAA4IBDwAwggEKAoIBAQCycllcGTBkvx2a
// SIG // YCAgQpl2U2w+G9ZvzMvx6mv+lxYQ4N86dIMaty+gMuz/
// SIG // 3sJCTiPVcgDbNVcKicquIEn08GisTUuNpb15S3GbRwfa
// SIG // /SXfnXWIz6pzRH/XgdvzvfI2pMlcRdyvrT3gKGiXGqel
// SIG // cnNW8ReU5P01lHKg1nZfHndFg4U4FtBzWwW6Z1KNpbJp
// SIG // L9oZC/6SdCnidi9U3RQwWfjSjWL9y8lfRjFQuScT5EAw
// SIG // z3IpECgixzdOPaAyPZDNoTgGhVxOVoIoKgUyt0vXT2Pn
// SIG // 0i1i8UU956wIAPZGoZ7RW4wmU+h6qkryRs83PDietHdc
// SIG // pReejcsRj1Y8wawJXwPTAgMBAAGjggFeMIIBWjAPBgNV
// SIG // HRMBAf8EBTADAQH/MB0GA1UdDgQWBBTLEejK0rQWWAHJ
// SIG // Ny4zFha5TJoKHzALBgNVHQ8EBAMCAYYwEgYJKwYBBAGC
// SIG // NxUBBAUCAwEAATAjBgkrBgEEAYI3FQIEFgQU/dExTtMm
// SIG // ipXhmGA7qDFvpjy82C0wGQYJKwYBBAGCNxQCBAweCgBT
// SIG // AHUAYgBDAEEwHwYDVR0jBBgwFoAUDqyCYEBWJ5flJRP8
// SIG // KuEKU5VZ5KQwUAYDVR0fBEkwRzBFoEOgQYY/aHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvbWljcm9zb2Z0cm9vdGNlcnQuY3JsMFQGCCsGAQUF
// SIG // BwEBBEgwRjBEBggrBgEFBQcwAoY4aHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3NvZnRS
// SIG // b290Q2VydC5jcnQwDQYJKoZIhvcNAQEFBQADggIBAFk5
// SIG // Pn8mRq/rb0CxMrVq6w4vbqhJ9+tfde1MOy3XQ60L/svp
// SIG // LTGjI8x8UJiAIV2sPS9MuqKoVpzjcLu4tPh5tUly9z7q
// SIG // QX/K4QwXaculnCAt+gtQxFbNLeNK0rxw56gNogOlVuC4
// SIG // iktX8pVCnPHz7+7jhh80PLhWmvBTI4UqpIIck+KUBx3y
// SIG // 4k74jKHK6BOlkU7IG9KPcpUqcW2bGvgc8FPWZ8wi/1wd
// SIG // zaKMvSeyeWNWRKJRzfnpo1hW3ZsCRUQvX/TartSCMm78
// SIG // pJUT5Otp56miLL7IKxAOZY6Z2/Wi+hImCWU4lPF6H0q7
// SIG // 0eFW6NB4lhhcyTUWX92THUmOLb6tNEQc7hAVGgBd3TVb
// SIG // Ic6YxwnuhQ6MT20OE049fClInHLR82zKwexwo1eSV32U
// SIG // jaAbSANa98+jZwp0pTbtLS8XyOZyNxL0b7E8Z4L5UrKN
// SIG // MxZlHg6K3RDeZPRvzkbU0xfpecQEtNP7LN8fip6sCvsT
// SIG // J0Ct5PnhqX9GuwdgR2VgQE6wQuxO7bN2edgKNAltHIAx
// SIG // H+IOVN3lofvlRxCtZJj/UBYufL8FIXrilUEnacOTj5XJ
// SIG // jdibIa4NXJzwoq6GaIMMai27dmsAHZat8hZ79haDJLmI
// SIG // z2qoRzEvmtzjcT3XAH5iR9HOiMm4GPoOco3Boz2vAkBq
// SIG // /2mbluIQqBC0N1AI1sM9MIIGBzCCA++gAwIBAgIKYRZo
// SIG // NAAAAAAAHDANBgkqhkiG9w0BAQUFADBfMRMwEQYKCZIm
// SIG // iZPyLGQBGRYDY29tMRkwFwYKCZImiZPyLGQBGRYJbWlj
// SIG // cm9zb2Z0MS0wKwYDVQQDEyRNaWNyb3NvZnQgUm9vdCBD
// SIG // ZXJ0aWZpY2F0ZSBBdXRob3JpdHkwHhcNMDcwNDAzMTI1
// SIG // MzA5WhcNMjEwNDAzMTMwMzA5WjB3MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSEwHwYDVQQDExhNaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw
// SIG // ggEKAoIBAQCfoWyx39tIkip8ay4Z4b3i48WZUSNQrc7d
// SIG // GE4kD+7Rp9FMrXQwIBHrB9VUlRVJlBtCkq6YXDAm2gBr
// SIG // 6Hu97IkHD/cOBJjwicwfyzMkh53y9GccLPx754gd6udO
// SIG // o6HBI1PKjfpFzwnQXq/QsEIEovmmbJNn1yjcRlOwhtDl
// SIG // KEYuJ6yGT1VSDOQDLPtqkJAwbofzWTCd+n7Wl7PoIZd+
// SIG // +NIT8wi3U21StEWQn0gASkdmEScpZqiX5NMGgUqi+YSn
// SIG // EUcUCYKfhO1VeP4Bmh1QCIUAEDBG7bfeI0a7xC1Un68e
// SIG // eEExd8yb3zuDk6FhArUdDbH895uyAc4iS1T/+QXDwiAL
// SIG // AgMBAAGjggGrMIIBpzAPBgNVHRMBAf8EBTADAQH/MB0G
// SIG // A1UdDgQWBBQjNPjZUkZwCu1A+3b7syuwwzWzDzALBgNV
// SIG // HQ8EBAMCAYYwEAYJKwYBBAGCNxUBBAMCAQAwgZgGA1Ud
// SIG // IwSBkDCBjYAUDqyCYEBWJ5flJRP8KuEKU5VZ5KShY6Rh
// SIG // MF8xEzARBgoJkiaJk/IsZAEZFgNjb20xGTAXBgoJkiaJ
// SIG // k/IsZAEZFgltaWNyb3NvZnQxLTArBgNVBAMTJE1pY3Jv
// SIG // c29mdCBSb290IENlcnRpZmljYXRlIEF1dGhvcml0eYIQ
// SIG // ea0WoUqgpa1Mc1j0BxMuZTBQBgNVHR8ESTBHMEWgQ6BB
// SIG // hj9odHRwOi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpL2Ny
// SIG // bC9wcm9kdWN0cy9taWNyb3NvZnRyb290Y2VydC5jcmww
// SIG // VAYIKwYBBQUHAQEESDBGMEQGCCsGAQUFBzAChjhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpL2NlcnRzL01p
// SIG // Y3Jvc29mdFJvb3RDZXJ0LmNydDATBgNVHSUEDDAKBggr
// SIG // BgEFBQcDCDANBgkqhkiG9w0BAQUFAAOCAgEAEJeKw1wD
// SIG // RDbd6bStd9vOeVFNAbEudHFbbQwTq86+e4+4LtQSooxt
// SIG // YrhXAstOIBNQmd16QOJXu69YmhzhHQGGrLt48ovQ7DsB
// SIG // 7uK+jwoFyI1I4vBTFd1Pq5Lk541q1YDB5pTyBi+FA+mR
// SIG // KiQicPv2/OR4mS4N9wficLwYTp2OawpylbihOZxnLcVR
// SIG // DupiXD8WmIsgP+IHGjL5zDFKdjE9K3ILyOpwPf+FChPf
// SIG // wgphjvDXuBfrTot/xTUrXqO/67x9C0J71FNyIe4wyrt4
// SIG // ZVxbARcKFA7S2hSY9Ty5ZlizLS/n+YWGzFFW6J1wlGys
// SIG // OUzU9nm/qhh6YinvopspNAZ3GmLJPR5tH4LwC8csu89D
// SIG // s+X57H2146SodDW4TsVxIxImdgs8UoxxWkZDFLyzs7BN
// SIG // Z8ifQv+AeSGAnhUwZuhCEl4ayJ4iIdBD6Svpu/RIzCzU
// SIG // 2DKATCYqSCRfWupW76bemZ3KOm+9gSd0BhHudiG/m4LB
// SIG // J1S2sWo9iaF2YbRuoROmv6pH8BJv/YoybLL+31HIjCPJ
// SIG // Zr2dHYcSZAI9La9Zj7jkIeW1sMpjtHhUBdRBLlCslLCl
// SIG // eKuzoJZ1GtmShxN1Ii8yqAhuoFuMJb+g74TKIdbrHk/J
// SIG // mu5J4PcBZW+JC33Iacjmbuqnl84xKf8OxVtc2E0bodj6
// SIG // L54/LlUWa8kTo/0xggTSMIIEzgIBATCBkDB5MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSMwIQYDVQQDExpNaWNyb3NvZnQg
// SIG // Q29kZSBTaWduaW5nIFBDQQITMwAAAQosea7XeXumrAAB
// SIG // AAABCjAJBgUrDgMCGgUAoIHrMBkGCSqGSIb3DQEJAzEM
// SIG // BgorBgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgor
// SIG // BgEEAYI3AgEVMCMGCSqGSIb3DQEJBDEWBBSRZz5Pw2Bl
// SIG // bAf6kSAKwOIhr8li/TCBigYKKwYBBAGCNwIBDDF8MHqg
// SIG // YIBeAGQAZQBmAGEAdQBsAHQAXwAyADAAZgA3AGQAOQA1
// SIG // ADgALQA3AGMAZgBhAC0ANAA4ADAAMgAtAGIANQBiADcA
// SIG // LQAxADcAYwBmADAAZAAzADkAZQA2AGIAYgAuAGoAc6EW
// SIG // gBRodHRwOi8vbWljcm9zb2Z0LmNvbTANBgkqhkiG9w0B
// SIG // AQEFAASCAQBle60tP5bMxDDaWbbESOKTBQVgZK8YobeJ
// SIG // sjLcMuXlXasjHEldV/k8oV1AHNljvpOA87Edj9EZa3rL
// SIG // qVpZQTYZ5F3N12J8Zy8WTkVwCjMoLrVjLFGdxl2du/Rb
// SIG // e7L7TOwLEKoKA4NoiFMBUE5XtoroOlDPG/J72yyZVXKu
// SIG // Vyxh/uqemdPZWEdtXvo9e0eVniDhEYX/cb9LrrtWzchm
// SIG // cJgLod5473hJKLd8TpeBe3J/XbU/4wS/QjSuJO1IaHY3
// SIG // igQBNzoaHFVFO7FC9Hwlh7k+ATXyIEft/lGEfeUBa33A
// SIG // WWOPPXqugpktHGlneszrRAHUJIrPuBD9JCkHNWyR8dut
// SIG // oYICKDCCAiQGCSqGSIb3DQEJBjGCAhUwggIRAgEBMIGO
// SIG // MHcxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xITAfBgNVBAMTGE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQQITMwAAAKxjFufj
// SIG // RlWzHAAAAAAArDAJBgUrDgMCGgUAoF0wGAYJKoZIhvcN
// SIG // AQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcN
// SIG // MTYwNjIwMjIwNDA2WjAjBgkqhkiG9w0BCQQxFgQU0cSI
// SIG // 2N+2aNiCN1GFa3Ru92smnhEwDQYJKoZIhvcNAQEFBQAE
// SIG // ggEADH/94WRjpj1QDyAi4p56pssHw5RFJbTfCxyLLond
// SIG // EuGwLArjYRbVOUnM9B9yChHrIq1xKi1tLw+xDEe6Mzb9
// SIG // /FupByo3lkiP0OJ/KEjYyfCtLhyQV0p8LN8IJxa7F766
// SIG // on+dzzQeF9bTO3ljg+3moA/vlUj9G08bnIix76nz1PmT
// SIG // bV1duzr9CFv4zsq09qAUCKMUYw7XNn/r+Bm0qbR+tNVh
// SIG // cLT3zCeE1V4JyFxTQa3MlV0sv+XHagw1cukM04kNteVB
// SIG // l1GOa5j0RjaFmqRj072yAS3KHZwRPBXSFNKIAk+fgBKb
// SIG // qt0BkINC3vncgePfqpOG46d4ZaN4/86oFPXh2Q==
// SIG // End signature block
