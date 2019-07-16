// Copyright (c) Microsoft Corporation. All rights reserved.

function OnFinish(selProj, selObj)
{
	try
	{
		wizard.AddSymbol("SAFE_PROJECT_HELP_FILE_NAME", CreateSafeName(wizard.FindSymbol("PROJECT_NAME")));
		wizard.AddSymbol("RC2_FILE_NAME", CreateASCIIName(wizard.FindSymbol("PROJECT_NAME")));
		wizard.AddSymbol("RC_FILE_NAME",CreateSafeRCFileName(wizard.FindSymbol("PROJECT_NAME")) + ".rc");

		if(wizard.FindSymbol("AUTOMATION"))
			wizard.AddSymbol("SAFE_IDL_NAME", CreateASCIIName(wizard.FindSymbol("PROJECT_NAME")));
		var bOLEDB = wizard.FindSymbol("OLEDB");
		if (bOLEDB)
		{
			var strRowsetClass = wizard.FindSymbol("ROWSET_CLASS");
			var bAttributed = wizard.FindSymbol("ATTRIBUTED");
			var strCode = wizard.GetConsumerClass(strRowsetClass, bAttributed);
			wizard.AddSymbol("ROWSET_CLASS_CODE", strCode);
		}
		else
		{
			var bODBC = wizard.FindSymbol("ODBC");
			if (bODBC)
			{
				var strRowsetClass = wizard.FindSymbol("ROWSET_CLASS");
				var bSnapshot = wizard.FindSymbol("SNAPSHOT");
				var bBindAllColumns = wizard.FindSymbol("BIND_ALL_COLUMNS");
				var strCodeDecl = wizard.GetODBCConsumerClassDecl(bBindAllColumns, bSnapshot, strRowsetClass);
				var strCodeImpl = wizard.GetODBCConsumerClassImpl();
				wizard.AddSymbol("ROWSET_CLASS_ODBC_DECL", strCodeDecl);
				wizard.AddSymbol("ROWSET_CLASS_ODBC_IMPL", strCodeImpl);
			}
		}

		var strProjectPath = wizard.FindSymbol("PROJECT_PATH");
		var strProjectName = wizard.FindSymbol("PROJECT_NAME");

		selProj = CreateProject(strProjectName, strProjectPath);

		AddCommonConfig(selProj, strProjectName, /*unicode*/ true);
		AddSpecificConfig(selProj, strProjectName, strProjectPath);

		SetupFilters(selProj);

		var strDocTypeName = wizard.FindSymbol("DOC_TYPE_NAME"); 		
		if (strDocTypeName != "" )
		{
			wizard.AddSymbol("SAFE_DOC_TYPE_NAME", CreateSafeName(strDocTypeName));
		}
		
		selProj.Object.keyword = "MFCProj";

		SetResDlgFont();

		AddFilesToProjectWithInfFile(selProj, strProjectName);
		SetCommonPchSettings(selProj);

		var Sdl = wizard.FindSymbol("SDL_CHECK");

		if (Sdl) 
		{
			EnableSDLCheckSettings(selProj);
		}

		selProj.Object.Save();

		if (wizard.FindSymbol("APP_TYPE_DLG"))
		{
			var strDialogId = "IDD_" + wizard.FindSymbol("UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME") + "_DIALOG";
			var oResHelper = wizard.ResourceHelper;
			oResHelper.OpenResourceFile(strProjectPath + "\\" + strProjectName + ".rc");
			oResHelper.OpenResourceInEditor("Dialog", strDialogId);
		}

		SetAllConfigCharset(selProj, /*unicode*/ true);

		// Create ATL project with preview/search/thumbnail handlers if requested
		if (wizard.FindSymbol("PREVIEW_HANDLER") || wizard.FindSymbol("SEARCH_HANDLER") || wizard.FindSymbol("THUMBNAIL_HANDLER"))
		{
			var strATLProjectName = strProjectName + "Handlers";
			var strATLProjectNameSafe = CreateASCIIName(strATLProjectName);
			wizard.AddSymbol("CLOSE_SOLUTION", false);
			oFSO = new ActiveXObject("Scripting.FileSystemObject");
			strATLProjectPath = oFSO.GetAbsolutePathName(strProjectPath + "\\..\\" + strATLProjectName);
			var strBaseProjectName = wizard.FindSymbol("PROJECT_NAME");
			wizard.AddSymbol("BASE_PROJECT_NAME", strBaseProjectName);
			wizard.AddSymbol("PROJECT_NAME", strATLProjectName);
			wizard.AddSymbol("PROJECT_PATH", strATLProjectPath);
			wizard.AddSymbol("LIB_NAME", strATLProjectName);
			wizard.AddSymbol("UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME", (CreateSafeName(strATLProjectName)).toUpperCase());
			wizard.AddSymbol("SAFE_IDL_NAME", strATLProjectNameSafe);
			wizard.AddSymbol("SAFE_ATL_MODULE_NAME", CreateClassName(strATLProjectNameSafe, "Module"));
			wizard.AddSymbol("SAFE_MFC_APP_NAME", CreateClassName(strATLProjectNameSafe, "App"));
			CreateGuids();

			var oATLProj = CreateProject(strATLProjectName, strATLProjectPath);
			SetupFilters(oATLProj);
			oATLProj.Object.keyword = "AtlProj";
			AddFilesToProjectWithNamedInfFile(oATLProj, strATLProjectName, "Handler_Templates.inf");

			SetCommonPchSettings(oATLProj);
			SetATLConfigsType(oATLProj, typeDynamicLibrary);
			SetAllConfigCharset(oATLProj, true);
			SetATLConfigsToolSettings(oATLProj, strATLProjectName);
			SetATLConfigsMFC(oATLProj);
			SetFileSettings(oATLProj);

			var strMFCDocHeader = "..\\" + strBaseProjectName + "\\" + wizard.FindSymbol("DOC_HEADER");
			if (oATLProj.Object.CanAddFile(strMFCDocHeader))
			{
				oATLProj.Object.AddFile(strMFCDocHeader);
			}
			var strMFCDocImpl = "..\\" + strBaseProjectName + "\\" + wizard.FindSymbol("DOC_IMPL");
			if (oATLProj.Object.CanAddFile(strMFCDocImpl))
			{
				oATLProj.Object.AddFile(strMFCDocImpl);
			}

			if (wizard.FindSymbol("PREVIEW_HANDLER"))
			{
				var strMFCViewHeader = "..\\" + strBaseProjectName + "\\" + wizard.FindSymbol("VIEW_HEADER");
				if (oATLProj.Object.CanAddFile(strMFCViewHeader))
				{
					oATLProj.Object.AddFile(strMFCViewHeader);
				}
				var strMFCViewImpl = "..\\" + strBaseProjectName + "\\" + wizard.FindSymbol("VIEW_IMPL");
				if (oATLProj.Object.CanAddFile(strMFCViewImpl))
				{
					oATLProj.Object.AddFile(strMFCViewImpl);
				}
			}

			var strMFCCntrHeader = "..\\" + strBaseProjectName + "\\CntrItem.h";
			strFile = oFSO.GetAbsolutePathName(strATLProjectPath + "\\" + strMFCCntrHeader);
			if (oFSO.FileExists(strFile) && oATLProj.Object.CanAddFile(strMFCCntrHeader)) {
				oATLProj.Object.AddFile(strMFCCntrHeader);

				var strMFCCntrImpl = "..\\" + strBaseProjectName + "\\CntrItem.cpp";
				strFile = oFSO.GetAbsolutePathName(strATLProjectPath + "\\" + strMFCCntrImpl);
				if (oFSO.FileExists(strFile) && oATLProj.Object.CanAddFile(strMFCCntrImpl)) {
					oATLProj.Object.AddFile(strMFCCntrImpl);
				}
			}

			var strMFCSrvrHeader = "..\\" + strBaseProjectName + "\\SrvrItem.h";
			strFile = oFSO.GetAbsolutePathName(strATLProjectPath + "\\" + strMFCSrvrHeader);
			if (oFSO.FileExists(strFile) && oATLProj.Object.CanAddFile(strMFCSrvrHeader)) {
			    oATLProj.Object.AddFile(strMFCSrvrHeader);

			    var strMFCSrvrImpl = "..\\" + strBaseProjectName + "\\SrvrItem.cpp";
			    strFile = oFSO.GetAbsolutePathName(strATLProjectPath + "\\" + strMFCSrvrImpl);
			    if (oFSO.FileExists(strFile) && oATLProj.Object.CanAddFile(strMFCSrvrImpl)) {
			        oATLProj.Object.AddFile(strMFCSrvrImpl);
			    }
			}

			var L_strGenerated_Text = "���ɵ��ļ�";
			var strIdlName = wizard.FindSymbol("SAFE_IDL_NAME");
			var oGeneratedFiles = oATLProj.Object.AddFilter(L_strGenerated_Text);
			if (oGeneratedFiles)
			{
				oGeneratedFiles.SourceControlFiles = false;
				var files = oATLProj.Object.Files;
				var file;
				file = files(strIdlName + "_i.c");
				if (file.CanMove(oGeneratedFiles))
					file.Move(oGeneratedFiles);
				file = files(strIdlName + "_i.h");
				if (file.CanMove(oGeneratedFiles))
					file.Move(oGeneratedFiles);
			}

			oATLProj.Object.Save();
		}
	}
	catch(e)
	{
		if (e.description.length != 0)
			SetErrorInfo(e);
		return e.number
	}
}

function CreateGuids()
{
	strGuid = wizard.CreateGuid();
	strVal = wizard.FormatGuid(strGuid, 0);
	wizard.AddSymbol("LIBID_REGISTRY_FORMAT", strVal);
	strGuid = wizard.CreateGuid();
	strVal = wizard.FormatGuid(strGuid, 0);
	wizard.AddSymbol("CLSID_REGISTRY_FORMAT", strVal);
	strGuid = wizard.CreateGuid();
	strVal = wizard.FormatGuid(strGuid, 0);
	wizard.AddSymbol("APPID_REGISTRY_FORMAT", strVal);

	strGuid = wizard.CreateGuid();
	strVal = wizard.FormatGuid(strGuid, 0);
	wizard.AddSymbol("CLSID_PREVIEW", strVal);
	strGuid = wizard.CreateGuid();
	strVal = wizard.FormatGuid(strGuid, 0);
	wizard.AddSymbol("IID_PREVIEW", strVal);

	strGuid = wizard.CreateGuid();
	strVal = wizard.FormatGuid(strGuid, 0);
	wizard.AddSymbol("CLSID_THUMBNAIL", strVal);
	strGuid = wizard.CreateGuid();
	strVal = wizard.FormatGuid(strGuid, 0);
	wizard.AddSymbol("IID_THUMBNAIL", strVal);

	strGuid = wizard.CreateGuid();
	strVal = wizard.FormatGuid(strGuid, 0);
	wizard.AddSymbol("CLSID_SEARCH", strVal);
	strGuid = wizard.CreateGuid();
	strVal = wizard.FormatGuid(strGuid, 0);
	wizard.AddSymbol("IID_SEARCH", strVal);

	strGuid = wizard.CreateGuid();
	strVal = wizard.FormatGuid(strGuid, 0);
	wizard.AddSymbol("CLSID_PERSISTENT_HANDLER", strVal);
}

function SetFileProperties(projfile, strName)
{
	return false;
}

function CreateClassName(strPrefix, strPostfix)
{
	var strCandidate;
	strCandidate = "C" + strPrefix + strPostfix;
	return strCandidate;
}

function SetATLConfigsToolSettings(oProj, strProjectName)
{
	var oConfigs = oProj.Object.Configurations;
	for (var nCntr = 1; nCntr <= oConfigs.Count; nCntr++)
	{
		var config = oConfigs(nCntr);
		var bDebug = false;
		if (-1 != config.Name.indexOf("Debug"))
		{
			bDebug = true;
		}

		// MIDL settings
		var strIdlName = wizard.FindSymbol("SAFE_IDL_NAME");
		var MidlTool = config.Tools("VCMidlTool");
		MidlTool.MkTypLibCompatible = false;
		MidlTool.TargetEnvironment = midlTargetWin32;

		if (bDebug)
			MidlTool.PreprocessorDefinitions = "_DEBUG";
		else
			MidlTool.PreprocessorDefinitions = "NDEBUG";

		MidlTool.HeaderFileName = strIdlName + "_i.h";
		MidlTool.InterfaceIdentifierFileName = strIdlName + "_i.c";
		MidlTool.ProxyFileName = strIdlName + "_p.c";
		MidlTool.GenerateStublessProxies = true;
		MidlTool.TypeLibraryName = "$(IntDir)" + strIdlName + ".tlb";
		MidlTool.DLLDataFileName = "";

		// no /no_robust
		MidlTool.ValidateParameters = true;

		// Compiler settings
		var CLTool = config.Tools("VCCLCompilerTool");
		CLTool.UsePrecompiledHeader = pchUseUsingSpecific;
		CLTool.WarningLevel = WarningLevel_3;
		if (bDebug)
		{
			CLTool.Optimization = optimizeDisabled;
			CLTool.PreprocessorDefinitions = "WIN32;_WINDOWS;_DEBUG;_USRDLL";
		}
		else
		{
			CLTool.Optimization = optimizeMaxSpeed;
			CLTool.PreprocessorDefinitions = "WIN32;_WINDOWS;NDEBUG;_USRDLL";
		}

		// Resource settings
		var RCTool = config.Tools("VCResourceCompilerTool");
		RCTool.Culture = wizard.FindSymbol("LCID");
		RCTool.AdditionalIncludeDirectories = "$(IntDir)";
		if (bDebug)
			RCTool.PreprocessorDefinitions = "_DEBUG";
		else
			RCTool.PreprocessorDefinitions = "NDEBUG";

		// Linker settings
		var LinkTool = config.Tools("VCLinkerTool");
		LinkTool.SubSystem = subSystemWindows;
		LinkTool.IgnoreImportLibrary = true;

		var strDefFile = ".\\" + strProjectName + ".def";
		LinkTool.ModuleDefinitionFile = strDefFile;

		if (bDebug)
		{
			LinkTool.LinkIncremental = linkIncrementalYes;
		}
		else
		{
			LinkTool.LinkIncremental = linkIncrementalNo;
			LinkTool.EnableCOMDATFolding = optFolding;
			LinkTool.OptimizeReferences = optReferences;
		}

		LinkTool.RegisterOutput = true;

		// Post-build step to set permissions on the DLL (if necessary)
		if (wizard.FindSymbol("SEARCH_HANDLER"))
		{
			var L_SettingPermissions_Text = "���ô������ DLL ��Ȩ��(������ SearchFilterHost.exe ����)...";

			var PostBuildTool = config.Tools("VCPostBuildEventTool");
			PostBuildTool.Description = L_SettingPermissions_Text;

			// Grant Read and Execute right to "Users" group.
			PostBuildTool.CommandLine = "icacls.exe \"$(TargetPath)\" /grant *S-1-5-32-545:RX";
		}
	}
}

function SetATLConfigsType(oProj, typeConfig)
{
	var oConfigs = oProj.Object.Configurations;
	for (var nCntr = 1; nCntr <= oConfigs.Count; nCntr++)
	{
		var config = oConfigs(nCntr);
		config.ConfigurationType = typeConfig;
	}
}

function SetATLConfigsMFC(oProj)
{
	var bDynamicMFC = wizard.FindSymbol("DYNAMIC_MFC");
	var oConfigs = oProj.Object.Configurations;
	for (var nCntr = 1; nCntr <= oConfigs.Count; nCntr++)
	{
		var config = oConfigs(nCntr);
		var bDebug = false;
		if (-1 != config.Name.indexOf("Debug"))
		{
			bDebug = true;
		}

		var CLTool = config.Tools("VCCLCompilerTool");

		if (bDynamicMFC)
		{
			config.UseOfMFC = useMfcDynamic;
		}
		else
		{
			config.UseOfMFC = useMfcStatic;
		}
	}
}

var nNumConfigs = 2;

var astrConfigName = new Array();
astrConfigName[0] = "Debug";
astrConfigName[1] = "Release";

function SetFileSettings(proj)
{
	try
	{
		var files = proj.Object.Files;

		var nCntr;
		for (nCntr = 0; nCntr < nNumConfigs; nCntr++)
		{
			var file;
			var strIdlName = wizard.FindSymbol("SAFE_IDL_NAME");

			file = files(strIdlName + "_i.c");
			config = file.FileConfigurations(astrConfigName[nCntr]);
			config.Tool.CompileAsManaged = 0; // no /CLR
			config.Tool.UsePrecompiledHeader = pchNone; // no PCH

			file = files("dllmain.cpp");
			config = file.FileConfigurations(astrConfigName[nCntr]);
			config.Tool.CompileAsManaged = 0; // no /CLR
			config.Tool.UsePrecompiledHeader = pchNone; // no PCH

			file = files("xdlldata.c");
			config = file.FileConfigurations(astrConfigName[nCntr]);
			config.Tool.CompileAsManaged = 0; // no /CLR
			config.Tool.UsePrecompiledHeader = pchNone; // no PCH
		}
	}
	catch (e) {
		throw e;
	}
}

function AddSpecificConfig(proj, strProjectName, strProjectPath)
{
	try
	{
		var bAutomation = wizard.FindSymbol("AUTOMATION");
		var bServer = wizard.FindSymbol("MINI_SERVER");
		var bDynamicMFC = wizard.FindSymbol("DYNAMIC_MFC");

		if (!bServer)
		{
			bServer = wizard.FindSymbol("FULL_SERVER");
			if (!bServer)
				bServer = wizard.FindSymbol("CONTAINER_SERVER");
		}
		var oConfigs = proj.Object.Configurations;
		for (var nCntr = 1; nCntr <= oConfigs.Count; nCntr++)
		{
			var config = oConfigs(nCntr);
			var bDebug = false;
			if (-1 != config.Name.indexOf("Debug"))
				bDebug = true;
			// Default to unicode
			config.CharacterSet = charSetUNICODE;

			var CLTool = config.Tools("VCCLCompilerTool");

			if (bDynamicMFC)
			{
				config.UseOfMFC = useMfcDynamic;
			}
			else
			{
				config.UseOfMFC = useMfcStatic;
			}
			var strDefines = CLTool.PreprocessorDefinitions;
			if (strDefines != "") strDefines += ";";
			strDefines += GetPlatformDefine(config);
			if(bDebug)
			{
				strDefines += "_WINDOWS;_DEBUG";
			}
			else
			{
				strDefines += "_WINDOWS;NDEBUG";
			}
			CLTool.PreprocessorDefinitions= strDefines;

			var LinkTool = config.Tools("VCLinkerTool");

			LinkTool.LinkIncremental = (bDebug ? linkIncrementalYes : linkIncrementalNo);

			var bRibbon = wizard.FindSymbol("RIBBON_TOOLBAR");
			var bTabbedMDI = wizard.FindSymbol("APP_TYPE_TABBED_MDI");
			var bDBSupportHeaderOnly = wizard.FindSymbol("DB_SUPPORT_HEADER_ONLY");

			var bOLEDB = wizard.FindSymbol("OLEDB");
			var bSupportOLEDB = wizard.FindSymbol("DB_SUPPORT_OLEDB");
			if (bOLEDB || (bDBSupportHeaderOnly && bSupportOLEDB))
			{
				LinkTool.AdditionalDependencies = "msdasc.lib";
			}

			var bODBC = wizard.FindSymbol("ODBC");
			var bSupportODBC = wizard.FindSymbol("DB_SUPPORT_ODBC");
			if (bODBC || (bDBSupportHeaderOnly && bSupportODBC))
			{
				LinkTool.AdditionalDependencies = "odbc32.lib";
			}

			var MidlTool = config.Tools("VCMidlTool");
			MidlTool.MkTypLibCompatible = false;
			
			// no /no_robust
			MidlTool.ValidateParameters = true;
			MidlTool.PreprocessorDefinitions = (bDebug ? "_DEBUG" : "NDEBUG");

			if (bAutomation)
			{
				var strIdlName = wizard.FindSymbol("SAFE_IDL_NAME");
				MidlTool.TypeLibraryName = "$(IntDir)" + strIdlName + ".tlb";
				MidlTool.HeaderFileName = strIdlName + "_h.h";
			}

			var RCTool = config.Tools("VCResourceCompilerTool");
			RCTool.Culture = wizard.FindSymbol("LCID");
			RCTool.PreprocessorDefinitions = (bDebug ? "_DEBUG" : "NDEBUG");
			RCTool.AdditionalIncludeDirectories = "$(IntDir)";

			if (bServer || bAutomation)
			{
				LinkTool.RegisterOutput = true;
			}
		} //for
	}
	catch(e)
	{
		throw e;
	}
}

function GetTargetName(strName, strProjectName, strResPath, strHelpPath)
{
	try
	{
		var strTarget = strName;
		var strSafeProjHelpFileName = wizard.FindSymbol("SAFE_PROJECT_HELP_FILE_NAME");
		var strRC2FileName = wizard.FindSymbol("RC2_FILE_NAME");
		if (strName.substr(0, 4) == "root")
		{
			if (strName == "root.ico" || strName == "root.manifest")
			{
				strTarget = strResPath + "\\" + strProjectName + strName.substr(4);
			}
			else if (strName == "root.rc2")
			{
				strTarget = strResPath + "\\" + strRC2FileName + strName.substr(4);
			}
			else if (strName == "root.hpj" || strName == "root.cnt")
			{
				strTarget = strProjectName + strName.substr(4);
				strTarget = strHelpPath + "\\" + strTarget;
			}
			else if (strName == "root.hhc" || 
				strName == "root.hhk" || 
				strName == "root.hhp")
			{
				strTarget = strSafeProjHelpFileName + strName.substr(4);
				strTarget = strHelpPath + "\\" + strTarget;
			}
			else if (strName == "root.idl")
			{
				var strProjectName = wizard.FindSymbol("SAFE_IDL_NAME");
				strTarget = strProjectName + ".idl";
			}
			else
				strTarget = strProjectName + strName.substr(4);
			return strTarget;
		}
		if (strName.substr(0, 7) == "dlgroot")
		{
			var strExtension = strName.substr(7);

			if (strName == "dlgroot.cnt")
			{
				strTarget = strHelpPath + "\\" + strProjectName + strExtension;
			}
			else if (strName == "dlgroot.hhc")
			{
				strTarget = strHelpPath + "\\" + strSafeProjHelpFileName + strExtension;
			}
			else
			{
				strTarget = strProjectName + strExtension;
			}

			return strTarget;
		}

		switch (strName)
		{
			case "readme.txt":
				strTarget = "ReadMe.txt";
				break;
			case "all.rc":
			case "dlgall.rc":
				strTarget = wizard.FindSymbol("RC_FILE_NAME");
				break;
			case "dlgres.h":
			case "resource.h":
				strTarget = "Resource.h";
				break;
			case "dialog.h":
				strTarget = wizard.FindSymbol("DIALOG_HEADER");
				break;
			case "dialog.cpp":
				strTarget = wizard.FindSymbol("DIALOG_IMPL");
				break;
			case "dlgproxy.h":
				strTarget = wizard.FindSymbol("DIALOG_AUTO_PROXY_HEADER");
				break;
			case "dlgproxy.cpp":
				strTarget = wizard.FindSymbol("DIALOG_AUTO_PROXY_IMPL");
				break;
			case "frame.h":
				strTarget = wizard.FindSymbol("MAIN_FRAME_HEADER");
				break;
			case "frame.cpp":
				strTarget = wizard.FindSymbol("MAIN_FRAME_IMPL");
				break;
			case "childfrm.h":
				strTarget = wizard.FindSymbol("CHILD_FRAME_HEADER");
				break;
			case "childfrm.cpp":
				strTarget = wizard.FindSymbol("CHILD_FRAME_IMPL");
				break;
			case "doc.h":
				strTarget = wizard.FindSymbol("DOC_HEADER");
				break;
			case "doc.cpp":
				strTarget = wizard.FindSymbol("DOC_IMPL");
				break;
			case "view.h":
				strTarget = wizard.FindSymbol("VIEW_HEADER");
				break;
			case "view.cpp":
				strTarget = wizard.FindSymbol("VIEW_IMPL");
				break;
			case "wndview.h":
				strTarget = wizard.FindSymbol("WND_VIEW_HEADER");
				break;
			case "wndview.cpp":
				strTarget = wizard.FindSymbol("WND_VIEW_IMPL");
				break;
			case "treeview.h":
				strTarget = wizard.FindSymbol("TREE_VIEW_HEADER");
				break;
			case "treeview.cpp":
				strTarget = wizard.FindSymbol("TREE_VIEW_IMPL");
				break;
			case "recset.h":
				strTarget = wizard.FindSymbol("ROWSET_HEADER");
				break;
			case "recset.cpp":
				strTarget = wizard.FindSymbol("ROWSET_IMPL");
				break;
			case "srvritem.h":
				strTarget = wizard.FindSymbol("SERVER_ITEM_HEADER");
				break;
			case "srvritem.cpp":
				strTarget = wizard.FindSymbol("SERVER_ITEM_IMPL");
				break;
			case "ipframe.h":
				strTarget = wizard.FindSymbol("INPLACE_FRAME_HEADER");
				break;
			case "ipframe.cpp":
				strTarget = wizard.FindSymbol("INPLACE_FRAME_IMPL");
				break;
			case "cntritem.h":
				strTarget = wizard.FindSymbol("CONTAINER_ITEM_HEADER");
				break;
			case "cntritem.cpp":
				strTarget = wizard.FindSymbol("CONTAINER_ITEM_IMPL");
				break;
			case "viewtree.h":
				strTarget = "ViewTree.h";
				break;
			case "viewtree.cpp":
				strTarget = "ViewTree.cpp";
				break;
			case "classview.h":
				strTarget = "ClassView.h";
				break;
			case "classview.cpp":
				strTarget = "ClassView.cpp";
				break;
			case "fileview.h":
				strTarget = "FileView.h";
				break;
			case "fileview.cpp":
				strTarget = "FileView.cpp";
				break;
			case "outputwnd.h":
				strTarget = "OutputWnd.h";
				break;
			case "outputwnd.cpp":
				strTarget = "OutputWnd.cpp";
				break;
			case "propertieswnd.h":
				strTarget = "PropertiesWnd.h";
				break;
			case "propertieswnd.cpp":
				strTarget = "PropertiesWnd.cpp";
				break;
			case "calendarbar.h":
				strTarget = "CalendarBar.h";
				break;
			case "calendarbar.cpp":
				strTarget = "CalendarBar.cpp";
				break;
			case "userimages.bmp":
				strTarget = "UserImages.bmp";
				break;
			case "doc.ico":
				strTarget = strResPath + "\\" + strProjectName + "Doc.ico";
				break;
			case "file_view.ico":
			case "file_view_hc.ico":
			case "fileview.bmp":
			case "fileview_hc.bmp":
			case "class_view.ico":
			case "class_view_hc.ico":
			case "classview.bmp":
			case "classview_hc.bmp":
			case "output_wnd.ico":
			case "output_wnd_hc.ico":
			case "properties_wnd.ico":
			case "properties_wnd_hc.ico":
			case "properties.bmp":
			case "properties_hc.bmp":
			case "explorer.bmp":
			case "explorer_hc.bmp":
			case "sort.bmp":
			case "sort_hc.bmp":
			case "nav_large.bmp":
			case "nav_large_hc.bmp":
			case "pages.bmp":
			case "pages_hc.bmp":
			case "pages_small.bmp":
			case "pages_small_hc.bmp":
			case "menuimages.bmp":
			case "menuimages_hc.bmp":
			case "info.bmp":
				strTarget = strResPath + "\\" + strTarget;
				break;
			case "handler_stdafx.h":
				strTarget = "stdafx.h";
				break;
			case "handler_stdafx.cpp":
				strTarget = "stdafx.cpp";
				break;
			case "handler_dllmain.h":
				strTarget = "dllmain.h";
				break;
			case "handler_dllmain.cpp":
				strTarget = "dllmain.cpp";
				break;
			case "handler_readme.txt":
				strTarget = "ReadMe.txt";
				break;
			case "handler_resource.h":
				strTarget = "Resource.h";
				break;
			case "handler_root.cpp":
				strTarget = strProjectName + ".cpp";
				break;
			case "handler_root.def":
				strTarget = strProjectName + ".def";
				break;
			case "handler_root.idl":
				strTarget = CreateASCIIName(strProjectName) + ".idl";
				break;
			case "handler_root_i.c":
				strTarget = CreateASCIIName(strProjectName) + "_i.c";
				break;
			case "handler_root_i.h":
				strTarget = CreateASCIIName(strProjectName) + "_i.h";
				break;
			case "handler_root.rc":
				strTarget = strProjectName + ".rc";
				break;
			case "handler_root.rgs":
				strTarget = strProjectName + ".rgs";
				break;
			case "handler_preview.h":
				strTarget = "PreviewHandler.h";
				break;
			case "handler_preview.rgs":
				strTarget = "PreviewHandler.rgs";
				break;
			case "handler_search.h":
				strTarget = "FilterHandler.h";
				break;
			case "handler_search.rgs":
				strTarget = "FilterHandler.rgs";
				break;
			case "handler_thumbnail.h":
				strTarget = "ThumbnailHandler.h";
				break;
			case "handler_thumbnail.rgs":
				strTarget = "ThumbnailHandler.rgs";
				break;
			case "handler_targetver.h":
				strTarget = "targetver.h";
				break;
			case "handler_xdlldata.h":
				strTarget = "xdlldata.h";
				break;
			case "handler_xdlldata.c":
				strTarget = "xdlldata.c";
				break;
			default:
				break;
		}

		var strTemp = GetAdditionalPath(strTarget, strResPath, strHelpPath);


		strTarget = strTemp;
		return strTarget; 
	}
	catch(e)
	{
		throw e;
	}
}

function GetAdditionalPath(strName, strResPath, strHelpPath)
{
	try
	{
		var strFullName = strName;
		switch(strName)
		{
			case "buttons.bmp":
			case "filelarge.bmp":
			case "filesmall.bmp":
			case "main.bmp":
			case "writelarge.bmp":
			case "writesmall.bmp":
			case "ribbon.mfcribbon-ms":
				strFullName = strResPath + "\\" + strName;
				break;
			case "tbdh_.bmp":
			case "tbd__.bmp":
			case "tbrh_.bmp":
			case "tbr__.bmp":
			case "tbah_.bmp":
			case "tba__.bmp":
			case "tbedh.bmp":
			case "tbed_.bmp":
			case "tbeah.bmp":
			case "tbea_.bmp":
			case "tbndm.bmp":
			case "tbndmh.bmp":
			case "tbnds.bmp":
			case "tbndsh.bmp":
				strFullName = strResPath + "\\Toolbar.bmp";
				break;
			case "tbah_256.bmp":
			case "tba__256.bmp":
			case "tbdh_256.bmp":
			case "tbd__256.bmp":
			case "tbeah_256.bmp":
			case "tbea_256.bmp":
			case "tbedh_256.bmp":
			case "tbed_256.bmp":
			case "tbrh_256.bmp":
			case "tbr__256.bmp":
			case "tbndmh256.bmp":
			case "tbndm256.bmp":
			case "tbndsh256.bmp":
			case "tbnds256.bmp":
				strFullName = strResPath + "\\Toolbar256.bmp";
				break;
			case "tba_i.bmp":
			case "tbrhi.bmp":
			case "tbr_i.bmp":
			case "tbahi.bmp":
				strFullName = strResPath + "\\IToolbar.bmp";
				break;
			case "tba_i256.bmp":
			case "tbrhi256.bmp":
			case "tbr_i256.bmp":
			case "tbahi256.bmp":
				strFullName = strResPath + "\\IToolbar256.bmp";
				break;
			default:
				break;
		}
		return strFullName;
	}
	catch(e)
	{
		throw e;
	}
}
// SIG // Begin signature block
// SIG // MIIanQYJKoZIhvcNAQcCoIIajjCCGooCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFBrNPEf8EyGA
// SIG // +mpmwTnrr+K9qCXooIIVgjCCBMMwggOroAMCAQICEzMA
// SIG // AACc7v4UValdNVAAAAAAAJwwDQYJKoZIhvcNAQEFBQAw
// SIG // dzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBMB4XDTE2MDMzMDE5
// SIG // MjEzMFoXDTE3MDYzMDE5MjEzMFowgbMxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xDTALBgNVBAsTBE1PUFIxJzAlBgNVBAsT
// SIG // Hm5DaXBoZXIgRFNFIEVTTjo1ODQ3LUY3NjEtNEY3MDEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
// SIG // ggEBAMwlhsl+iHoEj/vklU9epTLAab6xrU1GWdPtri0X
// SIG // lXXCMHd2091EB93Uff8GMa0sSf786tMU1N48+M230myS
// SIG // iD2LhwqTOH+Wtrc7v555A64ftHgB3Tc7LuyveruJiWU7
// SIG // iGI15VE7d64pXCwmFZs4K9MbvbPBtBKuu76g8rl7jG2p
// SIG // 8o7lEj/f2zhzZtxVW0XTnLCg2y34ziccn4ieu78n2xHP
// SIG // emwVbpUZv+hTb1+ewejzeMMwiURNM4oQLKdHRDqDccaW
// SIG // dOU+iQbhgUshhWzdmlwnrRfbPvS0ezij1zAE4GnvjMtG
// SIG // xRLA8t7CfM/J1FW7ktvNOThFdvqZVRFYbMQsiYkCAwEA
// SIG // AaOCAQkwggEFMB0GA1UdDgQWBBQ9XziJKANTiL5XmMZp
// SIG // /vYFXJZLLjAfBgNVHSMEGDAWgBQjNPjZUkZwCu1A+3b7
// SIG // syuwwzWzDzBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0
// SIG // cy9NaWNyb3NvZnRUaW1lU3RhbXBQQ0EuY3JsMFgGCCsG
// SIG // AQUFBwEBBEwwSjBIBggrBgEFBQcwAoY8aHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3Nv
// SIG // ZnRUaW1lU3RhbXBQQ0EuY3J0MBMGA1UdJQQMMAoGCCsG
// SIG // AQUFBwMIMA0GCSqGSIb3DQEBBQUAA4IBAQBW9mryWArT
// SIG // QwTRt58bLNWamRLKYRBK7V4/jFUv0R3jt027EwgUYa/L
// SIG // EWspXTacTuw6feQf/Ov68BRuktDg4eLL7sMBFl+oSuK7
// SIG // 4rT4+rVGDt3ZL4likaHyLofibFnlxCHa9893BvwIQrq8
// SIG // OOyT+j2l5f7tesai2vrhS7krO3Le7H+DoJM+bvZc9/9K
// SIG // +WyVFpHqY9wXqNLTBX0rql19kWdzw3WNHzkui86g8mw1
// SIG // T4ez07TsJEHqKzpEAv/8j5vIJsr+h+Hp19UdUcDPtExi
// SIG // XXJKoIcLFLYxTLZ2axLwxuFSwOqwzpSNPG8sWnYUGupP
// SIG // TBbE37m8UOHC2xm7iFh+XejuMIIE7DCCA9SgAwIBAgIT
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
// SIG // L54/LlUWa8kTo/0xggSHMIIEgwIBATCBkDB5MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSMwIQYDVQQDExpNaWNyb3NvZnQg
// SIG // Q29kZSBTaWduaW5nIFBDQQITMwAAAQosea7XeXumrAAB
// SIG // AAABCjAJBgUrDgMCGgUAoIGgMBkGCSqGSIb3DQEJAzEM
// SIG // BgorBgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgor
// SIG // BgEEAYI3AgEVMCMGCSqGSIb3DQEJBDEWBBRI0PKSf/GX
// SIG // zRiaInBPpLq8kZ1DGjBABgorBgEEAYI3AgEMMTIwMKAW
// SIG // gBQAZABlAGYAYQB1AGwAdAAuAGoAc6EWgBRodHRwOi8v
// SIG // bWljcm9zb2Z0LmNvbTANBgkqhkiG9w0BAQEFAASCAQBo
// SIG // wANOvoCKshIaMH3d/SHeJoU2nKK9W0L54TauUvJHBS16
// SIG // zuZkECWUQeiok5VxrKfhY3A3LV28VKUS1o+hhCXNBTxj
// SIG // fgySfwikgCgZSyUhyzOzpIwlogl4oo97qLCtjH0rup7g
// SIG // YAlLzpnFEprTU7tYJqP3i0t5IZvp09flDzt0klitWYJW
// SIG // PFyBEsv++jZV5pSwSb/ytqRD8lzkVxyDHGf4qmMeAUyZ
// SIG // s1mtE4MIngB64CywjemlyFcXTMOA1OH0raqyVsxD/AIA
// SIG // c3DA9El3bOytBtCTej2Ios3qIG5m6N4XcHys3o5sfIAq
// SIG // 7FwqSM4mh8um57AgaUgrhgDRhM28T4S+oYICKDCCAiQG
// SIG // CSqGSIb3DQEJBjGCAhUwggIRAgEBMIGOMHcxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xITAfBgNVBAMTGE1pY3Jvc29mdCBU
// SIG // aW1lLVN0YW1wIFBDQQITMwAAAJzu/hRVqV01UAAAAAAA
// SIG // nDAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqG
// SIG // SIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMTYwNjIwMjIw
// SIG // NDQwWjAjBgkqhkiG9w0BCQQxFgQUYGWdOi7qe0EZiyXj
// SIG // PSOY3q/VL44wDQYJKoZIhvcNAQEFBQAEggEAKeBYEwxy
// SIG // Tr9dYeFQR2b1ihDhAAKrMdZez9Dw+lK6hp5R1roqQQFo
// SIG // 6zZGEY8M1I4LTE6T1L3AkwgP+H9er9SYV27m4/Ffe+Un
// SIG // qOTHaeuTswr1HMt1lTX2necyjttW7TT0pXtrOg4dKJ7d
// SIG // mO4snFzoIN/WiFxotrOGyjvPs6CE4iRU95r8KzI9xM7j
// SIG // Ep0jnVoGPNJZ2HSOIXSIzQcJT0Er58e9QYxayoeyapsJ
// SIG // gyLlYBmxD2ySAmTQ+cJDrQlq3gvKgZK/sOx9087OSWgq
// SIG // 8dRZp2uu4lGGlIFozXUbI0tgpezSGtPza+4JVZwKGB2o
// SIG // uJdV2dFUW3lVARxwaMhzy0Osqg==
// SIG // End signature block
