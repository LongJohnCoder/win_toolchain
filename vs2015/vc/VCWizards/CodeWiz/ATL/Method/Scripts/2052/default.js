// Copyright (c) Microsoft Corporation. All rights reserved.
// Script for Add Method Wizard

var aryParamVT = new Array;
var aryParamTypeNames = new Array;
var aryParamAttribs = new Array;
var bEmbeddedIDL = false;

function OnPrep(selProj, selObj)
{
	var L_WizardDialogTitle_Text = "添加方法向导";
	return PrepCodeWizard(selProj, L_WizardDialogTitle_Text);
}

function OnFinish(selProj, oInterface)
{
	var oCM;
	try
	{
		oCM	= selProj.CodeModel;
		oCM.Synchronize();

		var L_TRANSACTION_Text = "添加方法 ";
		var strInternalName	= wizard.FindSymbol("INTERNAL_NAME");
		oCM.StartTransaction(L_TRANSACTION_Text + strInternalName);

		if (typeDynamicLibrary == selProj.Object.Configurations(1).ConfigurationType)
			wizard.AddSymbol("DLL", true);
		else
			wizard.AddSymbol("DLL", false);

		var bMFC = wizard.FindSymbol("MFC_CLASS");
		InitParams(bMFC);

		if (oInterface.Language==vsCMLanguageIDL)
		{
			bEmbeddedIDL = false;
		}
		else
		{
			bEmbeddedIDL = true;
		}

		var strAttributes = GetAttributes();
		AddToIDL(oInterface, strAttributes);

		// Class changes
		var aryClasses = new Array();
		var strInterface = oInterface.Name;
		GetInterfaceClass(oCM, strInterface, oInterface.FullName, aryClasses, true);
		for (var nIndex = 0; nIndex < aryClasses.length; nIndex++)
		{
			var oClass = aryClasses[nIndex];

			// MFC class
			if (bMFC && oClass.IsDerivedFrom("CCmdTarget"))
				AddToMFCClass(oClass, selProj);

			// non-MFC class
			else
				AddToClass(oClass, selProj);
		}

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

function AddToMFCClass(oClass, oProj)
{
	try
	{
		var bStock				= wizard.FindSymbol("STOCK");
		var strReturnType		= wizard.FindSymbol("RETURN_TYPE");
		var strExternalName		= wizard.FindSymbol("EXTERNAL_NAME");
		var nNumParams			= wizard.FindSymbol("NUM_PARAMETERS");
		var strInternalName		= wizard.FindSymbol("INTERNAL_NAME");
		var strDispid			= wizard.FindSymbol("DISPID");

		var strClassName = oClass.Name;
		var oMap = oClass.Maps.Find("DISPATCH");

		if (bStock)
		{
			var strStockMacro = wizard.FindSymbol("STOCK_MACRO");
			if(!oMap.Entries.Find(strStockMacro))
				oMap.AddEntry(strStockMacro, vsCMAddPositionEnd);
		}
		else
		{
			var strMapItem = "DISP_FUNCTION_ID";
			strMapItem += "(" + strClassName;
			strMapItem += ', "' + strExternalName + '"';
			strMapItem += ", dispid" + strExternalName;
			strMapItem += ", " + strInternalName;
			strMapItem += ", " + wizard.FindSymbol("RETURN_TYPE_VT");

			if(aryParamVT.length>0)
			{
				strMapItem += ",";
				for (nCntr = 0; nCntr < aryParamVT.length; nCntr++)
				{
					strMapItem += " " + aryParamVT[nCntr];
				}
			}
			else
				strMapItem += ", VTS_NONE";
			strMapItem += ")";

			oMap.AddEntry(strMapItem, vsCMAddPositionEnd);

			// add prototype and implementation
			var strCPP = oMap.Location(vsCMWhereDefault);
			var config = oProj.Object.Configurations(1);
			var MidlTool = config.Tools("VCMidlTool");
			var bDefaultUnsigned = (MidlTool.DefaultCharType==midlCharUnsigned);

			var strParams = "(";
			for (nCntr = 0; nCntr < nNumParams; nCntr++)
			{
				if (nCntr > 0)
					strParams += ", ";
				if (aryParamTypeNames[nCntr].substr(0, 5) == "BSTR " &&
					aryParamTypeNames[nCntr].substr(0, 6) != "BSTR *")
				{
					strParams += "LPCTSTR " + aryParamTypeNames[nCntr].substr(5);
				}
				else if (aryParamTypeNames[nCntr].substr(0, 8) == "VARIANT " &&
					aryParamTypeNames[nCntr].substr(0, 9) != "VARIANT *")
				{
					strParams += "VARIANT &" + aryParamTypeNames[nCntr].substr(8);
				}
				else
				{
					strParams += AddUnsignedToChar(aryParamTypeNames[nCntr], bDefaultUnsigned)
				}
			}
			strParams += ")";

			strReturnType = AddUnsignedToChar(strReturnType, bDefaultUnsigned);
			var oFunction = oClass.AddFunction(strInternalName + strParams, vsCMFunctionFunction, strReturnType, vsCMAddPositionEnd, vsCMAccessProtected, strCPP);

			oFunction.BodyText = GetFunctionBodyForReturnType(strReturnType);

			// add dispidXXX in enum in Class.h
			var oEnum;
			if (oClass.Enums.Count)
				oEnum = oClass.Enums(1);
			else
				oEnum = oClass.AddEnum("", vsCMAddPositionEnd);

			var oEnumMember = oEnum.AddMember("dispid" + strExternalName, vsCMAddPositionEnd);
			oEnumMember.InitExpression = strDispid + "L";
		}
	}
	catch(e)
	{
		throw e;
	}
}


function AddToClass(oClass, oProj)
{
	try
	{
		var strReturnType		= wizard.FindSymbol("RETURN_TYPE");
		var strExternalName		= wizard.FindSymbol("EXTERNAL_NAME");
		var nNumParams			= wizard.FindSymbol("NUM_PARAMETERS");

		var strCPP = oClass.Location(vsCMWhereDefault);
		strCPP = strCPP.substr(strCPP.lastIndexOf("\\")+1);
		strCPP = strCPP.substring(0, strCPP.lastIndexOf(".")+1) + "cpp";
		if (!oProj.Object.Files(strCPP))
			strCPP = "";

		var config = oProj.Object.Configurations(1);
		var MidlTool = config.Tools("VCMidlTool");
		var bDefaultUnsigned = (MidlTool.DefaultCharType==midlCharUnsigned);

		var strParams = "(";
		for (nCntr = 0; nCntr < nNumParams; nCntr++)
		{
			if (nCntr > 0)
				strParams += ", ";
			if (aryParamTypeNames[nCntr].substr(0, 10) == "SAFEARRAY(")
			{
				strParams += "SAFEARRAY * " + aryParamTypeNames[nCntr].substr(aryParamTypeNames[nCntr].indexOf(')') + 2);
			}
			else if (aryParamTypeNames[nCntr].substr(0, 8) == "VARIANT " &&
					aryParamTypeNames[nCntr].substr(0, 9) != "VARIANT *")
			{
				strParams += "VARIANT " + aryParamTypeNames[nCntr].substr(8);
			}
			else
			{
				strParams += AddUnsignedToChar(aryParamTypeNames[nCntr], bDefaultUnsigned)
			}
		}
		strParams += ")";

		strReturnType = AddUnsignedToChar(strReturnType, bDefaultUnsigned);
		var oFunction = oClass.AddFunction(strExternalName + strParams, vsCMFunctionComMethod, strReturnType, vsCMAddPositionEnd, vsCMAccessPublic, strCPP);

		oFunction.BodyText = GetFunctionBodyForReturnType(strReturnType);
	}
	catch(e)
	{
		throw e;
	}
}

function AddToIDL(oInterface, strAttributes)
{
	try
	{
		var bStock				= wizard.FindSymbol("STOCK");
		var strReturnType		= wizard.FindSymbol("RETURN_TYPE");
		var strExternalName		= wizard.FindSymbol("EXTERNAL_NAME");
		var strInterfaceType	= wizard.FindSymbol("INTERFACE_TYPE");
		var nNumParams			= wizard.FindSymbol("NUM_PARAMETERS");

		var strAllAttribs = "	[";
		if (bStock)
			strAllAttribs += "id(" + wizard.FindSymbol("STOCK_DISPID") + ")";
		else
		{
			if (strInterfaceType != "custom")
				strAllAttribs += "id(" + wizard.FindSymbol("DISPID") + ")";
		}

		if (strAttributes.length > 0) {
			if (strAllAttribs != "[") {
				strAllAttribs += ", " + strAttributes + "] ";
			} else {
				strAllAttribs += strAttributes + "] ";
			}
		} else {
			strAllAttribs += "] ";
		}

		strRet = strAllAttribs + strReturnType;

		var strParams = "(";
		for (nCntr = 0; nCntr < nNumParams; nCntr++)
		{
			if (nCntr > 0)
				strParams += ", ";
			if (bEmbeddedIDL && aryParamTypeNames[nCntr].substr(0, 10) == "SAFEARRAY(")
			{
				strParams += "["
				if (aryParamAttribs[nCntr].length)
					strParams += aryParamAttribs[nCntr] + ", ";
				strParams += "satype(";
				strParams += aryParamTypeNames[nCntr].substring(10, aryParamTypeNames[nCntr].indexOf(')'));
				strParams += ")] ";
				strParams += "SAFEARRAY * " + aryParamTypeNames[nCntr].substr(aryParamTypeNames[nCntr].indexOf(')') + 2);
			}
			else
			{
				if (aryParamAttribs[nCntr].length)
					strParams += "[" + aryParamAttribs[nCntr] + "] ";
				strParams += aryParamTypeNames[nCntr];
			}
		}
		strParams += ")";

		var oFunction = oInterface.AddFunction(strExternalName + strParams, vsCMFunctionFunction, strRet, vsCMAddPositionEnd, vsCMAccessDefault);
	}
	catch(e)
	{
		throw e;
	}
}

function InitParams(bMFC)
{
	try
	{
		var nNumParams = wizard.FindSymbol("NUM_PARAMETERS");
		for (var nCntr = 0; nCntr < nNumParams; nCntr++)
		{
			if (bMFC)
				aryParamVT[nCntr] = wizard.FindSymbol("PARAM_VT_TYPE" + nCntr);
			aryParamTypeNames[nCntr] = wizard.FindSymbol("PARAM_TYPE_NAME" + nCntr);
			if (aryParamTypeNames[nCntr].substr(0, 12) == "OLE_TRISTATE")
				aryParamTypeNames[nCntr] = "enum " + aryParamTypeNames[nCntr];
			aryParamAttribs[nCntr] = wizard.FindSymbol("PARAM_ATTRIB" + nCntr);
		}

		var strReturnType = wizard.FindSymbol("RETURN_TYPE");
		if (strReturnType.substr(0, 12) == "OLE_TRISTATE")
		{
			strReturnType = "enum " + strReturnType;
			wizard.AddSymbol("RETURN_TYPE", strReturnType);
		}
	}
	catch(e)
	{
		throw e;
	}
}

function GetAttributes()
{
	try
	{
		var strHelpString		= wizard.FindSymbol("HELP_STRING");
		var strCallAs			= wizard.FindSymbol("CALL_AS");
		var strHelpContext		= wizard.FindSymbol("HELP_CONTEXT");
		var bHidden				= wizard.FindSymbol("HIDDEN");
		var bLocal				= wizard.FindSymbol("LOCAL");
		var bRestricted			= wizard.FindSymbol("RESTRICTED");
		var bSource				= wizard.FindSymbol("SOURCE");
		var bVararg				= wizard.FindSymbol("VAR_ARG");

		var strAttributes = "";

		if (strHelpString != "")
			strAttributes += ', helpstring("' + strHelpString + '")';

		if (strCallAs != "")
			strAttributes += ', call_as(' + strCallAs + ')';

		if (strHelpContext != "")
			strAttributes += ', helpcontext(' + strHelpContext + ')';

		if (bHidden)
			strAttributes += ", hidden";

		if (bLocal)
			strAttributes += ", local";

		if (bRestricted)
			strAttributes += ", restricted";

		if (bSource)
			strAttributes += ", source";

		if (bVararg)
			strAttributes += ", vararg";

		if (strAttributes.length > 1)
			strAttributes = strAttributes.substr(2);

		return strAttributes;
	}
	catch(e)
	{
		throw e;
	}
}

function GetFunctionBodyForReturnType(strReturnType)
{
	try
	{
		var strBody = "";
		var strComment = "";
		var bMFCProject = wizard.FindSymbol("MFC_PROJECT");
		if (bMFCProject)
		{
			var bDLL = wizard.FindSymbol("DLL");
			if (bDLL)
				strBody = "AFX_MANAGE_STATE(AfxGetStaticModuleState());\r\n\r\n";
			else
				strBody = "AFX_MANAGE_STATE(AfxGetAppModuleState());\r\n\r\n";
		}

		var bMFC = wizard.FindSymbol("MFC_CLASS");
		if (bMFC)
		{
			var L_Comment1_Text = "\57\57 TODO: 在此添加调度处理程序代码\r\n\r\n";
			strComment = L_Comment1_Text;
		}
		else
		{
			var L_Comment2_Text = "\57\57 TODO: 在此添加实现代码\r\n\r\n";
			strComment = L_Comment2_Text;
		}
		switch(strReturnType)
		{
			case "IDispatch*":
			case "IFontDisp*":
			case "IPictureDisp*":
			case "IUnknown*":
			case "OLE_HANDLE":
				strBody += strComment;
				strBody += "return NULL;\r\n";
				break;

			case "DATE":
				strBody += strComment;
				strBody += "return (DATE)0;\r\n";
				break;

			case "OLE_COLOR":
				strBody += strComment;
				strBody += "return RGB(0,0,0);\r\n";
				break;

			case "enum OLE_TRISTATE":
				strBody += strComment;
				strBody += "return (OLE_TRISTATE)0;\r\n";
				break;

			case "HRESULT":
			case "SCODE":
				strBody += strComment;
				strBody += "return S_OK;\r\n";
				break;

			case "BSTR":
				if (bMFC)
				{
					strBody += "CString strResult;\r\n\r\n";
					strBody += strComment;
					strBody += "return strResult.AllocSysString();\r\n";
				}
				else
				{
					strBody += strComment;
					strBody += "return NULL;\r\n";
				}
				break;

			case "CY":
				strBody += "CURRENCY cyResult = { 0, 0 };\r\n\r\n";
				strBody += strComment;
				strBody += "return cyResult;\r\n";
				break;

			case "VARIANT":
				strBody += "VARIANT vaResult;\r\n";
				strBody += "VariantInit(&vaResult);\r\n\r\n";
				strBody += strComment;
				strBody += "return vaResult;\r\n";
				break;

			case "VARIANT_BOOL":
				strBody += strComment;
				strBody += "return VARIANT_TRUE;\r\n";
				break;

			case "void":
				strBody += strComment.substr(0, strComment.length-2);;
				break;

			default:
				strBody += strComment;
				strBody += "return 0;\r\n";
				break;
		}
		return strBody;
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
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFPt+ztqmk/2H
// SIG // F9ESfEu5Ac6Axg6doIIVgjCCBMMwggOroAMCAQICEzMA
// SIG // AACdQmjuMRzXVr0AAAAAAJ0wDQYJKoZIhvcNAQEFBQAw
// SIG // dzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBMB4XDTE2MDMzMDE5
// SIG // MjEzMFoXDTE3MDYzMDE5MjEzMFowgbMxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xDTALBgNVBAsTBE1PUFIxJzAlBgNVBAsT
// SIG // Hm5DaXBoZXIgRFNFIEVTTjoxNDhDLUM0QjktMjA2NjEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
// SIG // ggEBAMvD7zaof/MpdTK2RrztdfdLzaj+0Eta6aPh4Pfn
// SIG // 9lTn/y1k7EKBtBQzsLECgwQsqzbuU1XOPgOGbr6jfu7q
// SIG // dmSK9xbVULAH9SukyUgadiVrp47MFQbuO1AHz+PTwyAS
// SIG // 6A7dWOGl8yPvTSW4mk8F46LOs2AykPr+tzTumBMnx3zq
// SIG // Xm6+/YKmzYIT79YYvbYQbbxzG18JFGUZpK2r6rw/Ayoh
// SIG // RpgTDoPyLjfBvzDxIXSJp5ZGBQXZ1uD9CvURc76wAVph
// SIG // 98NhhLp2sXDgJqG/cW2WUfFX7a32AjZHx0xWBp2jTYEa
// SIG // ldaxBbfOuq3vLnscjYzlX5kffiQSlBWwNBCzD5UCAwEA
// SIG // AaOCAQkwggEFMB0GA1UdDgQWBBRk6k/zPCryhAlgdAYV
// SIG // RgyudvnzOjAfBgNVHSMEGDAWgBQjNPjZUkZwCu1A+3b7
// SIG // syuwwzWzDzBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0
// SIG // cy9NaWNyb3NvZnRUaW1lU3RhbXBQQ0EuY3JsMFgGCCsG
// SIG // AQUFBwEBBEwwSjBIBggrBgEFBQcwAoY8aHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3Nv
// SIG // ZnRUaW1lU3RhbXBQQ0EuY3J0MBMGA1UdJQQMMAoGCCsG
// SIG // AQUFBwMIMA0GCSqGSIb3DQEBBQUAA4IBAQA/XRxIfkcv
// SIG // 2gydWAEcwbExnqbZ0QTu9xfz+8BfHQu50zzRVKrWYTsm
// SIG // pEvDQP2cMO+J+IL5tQFnxxozdQKPDYi9yesBZpjjfzxF
// SIG // HVwNs1hWIYHkXgj5gE28DTdON3nB4ho1jvknjGKb5dRu
// SIG // JmtDSFCWrvQ5k5H2jLzTCvv6zZY69zEfG8bEjmccdolI
// SIG // mrTdHHjJiD+YEvb1KQ8U2ZMVbDHwOZ+t49fEzneDCc/h
// SIG // tCOtsqiL7WMuxk8d/EheeuOeMKjJ4ImHKjNgY7+sbtRs
// SIG // h01B+7/5dtSQXHiLdN4JrCIZSzaPMyItul+g9bBggRGV
// SIG // dWFMkAvSFdh+tua1VMhWZPH+MIIE7DCCA9SgAwIBAgIT
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
// SIG // BgEEAYI3AgEVMCMGCSqGSIb3DQEJBDEWBBQ3zsRXEK+m
// SIG // BcUQjYwzMclNu31ExDCBigYKKwYBBAGCNwIBDDF8MHqg
// SIG // YIBeAGQAZQBmAGEAdQBsAHQAXwBlADEAYQBhAGIANgBl
// SIG // ADUALQA3ADkAZQBlAC0ANABhAGQAZgAtADgAOQBkADEA
// SIG // LQBiADMAMwBlAGIANQBhAGQAMQA3ADAAZgAuAGoAc6EW
// SIG // gBRodHRwOi8vbWljcm9zb2Z0LmNvbTANBgkqhkiG9w0B
// SIG // AQEFAASCAQA9i1Cps586H+/v9tl70pEUKGPllrnNraK7
// SIG // Co7jr3mPbgRflp19cVafjjW8KWaubjcOuaJYeteMfGNi
// SIG // f+VftwWzu+6BssYLp5b3aUqdPUlxbyXd3tRXzHjq/ib6
// SIG // pMzBC8tjjwLBZqPlTQyP2X6QHRYymxVxAuN4qlC0yop0
// SIG // b3/AHxKFo5OFKHWJQ0hF+Qwov8A7t2FSiZZtyqfjEFSa
// SIG // 897o/pa0r0wZ3Jl3OkiISQ4hNX4wCXpkJmh568+GXhh9
// SIG // 20FbIyaf6kCeew8YOLUMcycmHVzm1fzwq9hnb7SPBBPm
// SIG // H8fJrzYz5IWL5ZlnFMUC4YdfqcUhj6dXlXYz+qU0Tkkx
// SIG // oYICKDCCAiQGCSqGSIb3DQEJBjGCAhUwggIRAgEBMIGO
// SIG // MHcxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xITAfBgNVBAMTGE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQQITMwAAAJ1CaO4x
// SIG // HNdWvQAAAAAAnTAJBgUrDgMCGgUAoF0wGAYJKoZIhvcN
// SIG // AQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcN
// SIG // MTYwNjIwMjIwNDA4WjAjBgkqhkiG9w0BCQQxFgQUY7+d
// SIG // friR7cd+pV8LfjXmg6Oi1fUwDQYJKoZIhvcNAQEFBQAE
// SIG // ggEAVPm4AS2ok472/dckSHi7rCUxk2Q4cSYdHDU8pRlI
// SIG // wYLq/ppFr7TgeqO3iE2bYuYj+mDi36oRKXM+Qa9IJTmW
// SIG // L4JMWJzlPkgv6JhQa4u2250xhcUz24bowDvAxPsG1KIf
// SIG // 5eJMG89wvlANMiEAo6Fr9ZtvPcG0jRw0HX7I5gE9X0bz
// SIG // cAHzh5ku3YrOK3or3Dg3fZ4Ma27ckT0fncPuJ6yJ2nnQ
// SIG // zBOzXMAr0ByFv/Yhyf+bFB7D+d8fZsEe/eCof+Tq9vtm
// SIG // fHK1wagG3kJ3KLHpOIM4CZRMqN/Sm1+bHYf0q7XG5qIb
// SIG // sv7Tj3Ng8k5xRI5P0HuIFnenJU8xKW33AhlXiA==
// SIG // End signature block
