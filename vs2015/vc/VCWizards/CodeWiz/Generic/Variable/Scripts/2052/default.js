// Copyright (c) Microsoft Corporation. All rights reserved.

function OnPrep(selProj, selObj)
{
	var L_WizardDialogTitle_Text = "添加成员变量向导";
	return PrepCodeWizard(selProj, L_WizardDialogTitle_Text);
}

function OnFinish(selProj, Class)
{
	var oCM;
	try
	{
		oCM	= selProj.CodeModel;
		//Ask user to add AfxRichEditInit2() call and adds TODO comment.
		//This is not part of the transaction since it has to do with adding
		//the resource itself (better done in resource editor).
		RichEditInit(oCM);

		var strName = wizard.FindSymbol("VARIABLE_NAME");
		var L_TransactionName_Text = "添加变量 ";
		oCM.StartTransaction(L_TransactionName_Text + strName);

		var strComment = wizard.FindSymbol("COMMENT");
		var vsAccess = wizard.FindSymbol("ACCESS");
		var strType = wizard.FindSymbol("VARIABLE_TYPE");

		var strClass = wizard.FindSymbol("PARENT_NAME");
		if(Class.Name != strClass)
		{
			var L_WrongContextObjectErr_Text = "OnFinish 中的错误上下文对象";
			throw (L_WrongContextObjectErr_Text);
		}

		var bUpdate = wizard.FindSymbol("UPDATE");
		var newVariable;
		if (!bUpdate)
		{
			newVariable = Class.AddVariable(strName, strType, vsCMAddPositionEnd, vsAccess);

	//		var extender = newVariable.Extender("MFCVariable");
	//		extender.MaxValue = 100;
	//		extender.MinValue = 1;

			if(strComment != "")
				newVariable.Comment=strComment;

			//prepare the initializer expression for some of the known variable types
				var strInit = strName + '(';

			var NamePos, NameLength, NameLengthPos;
			NameLengthPos = new VBArray(wizard.CppParseTypeString(strType));

			NamePos = NameLengthPos.getItem(0);
			NameLength = NameLengthPos.getItem(1);

			var strTypeTail = strType.substr(NamePos+NameLength);
			var strTypeHead = strType.substr(0, NamePos);

			var indexCloseParen = strTypeTail.indexOf(')');
			var indexOpenBra = strTypeTail.indexOf('[');
			var indexTemplate = strTypeHead.indexOf('<');
			if((indexOpenBra !=-1 && (indexCloseParen==-1 || indexOpenBra<indexCloseParen)) ||
				indexTemplate!=-1)
			{
				strInit = ""; //array type or template type
			}
			else if(strTypeHead.indexOf('*')!=-1)
			{
				// assume it's enough, although could check if * is within innermost ()
				strInit += "NULL"; //pointer type
			}
			else if(strType=="bool")
			{
				strInit += "false";
			}
			else if(strType=="BOOL")
				{
				strInit += "FALSE";
			}
			else if(strType.indexOf("char")!=-1
					|| strType.indexOf("double")!=-1
					|| strType.indexOf("float")!=-1
					|| strType.indexOf("int")!=-1
					|| strType.indexOf("long")!=-1
					|| strType.indexOf("short")!=-1)
			{
				strInit += '0';
			}

			// the following are special type cases custom-initialized as VC6.0 class wizard was doing
			else if(strType.indexOf("INT")!=-1
					|| strType.indexOf("UINT")!=-1
					|| strType.indexOf("LONG")!=-1
					|| strType.indexOf("ULONG")!=-1
					|| strType.indexOf("DWORD")!=-1
					|| strType.indexOf("BYTE")!=-1
					|| strType=="CTime")
			{
				strInit += '0';
			}
			else if(strType=="CString")
			{
				strInit += "_T(\"\")";
			}
			else if(strType=="COleDateTime")
			{
				strInit += "COleDateTime::GetCurrentTime()";
			}
			else if(strType=="COleCurrency")
			{
				strInit += "COleCurrency(0, 0)";
			}
			else if(strType == "GUID")
			{
				strInit += "GUID_NULL";
			}
			else
			{
				// unrecognized type
				strInit = "";
			}
			if(strInit.length)
				strInit += ')';

			if(strType == "DECIMAL")
			{
				strInit = "\tZeroMemory(&" + strName + ", sizeof(DECIMAL));\r\n"
			}
			else if(strType == "FILETIME")
			{
				strInit = "\tZeroMemory(&" + strName + ", sizeof(FILETIME));\r\n"
			}

			// unrecognized variable types (when strInit is empty) do not have initializers, only default constructor
			if(strInit.length)
			{
				var oFunctions = Class.Functions;
				for(var cnt=1; cnt<=oFunctions.Count;cnt++)
				{
					var oFunction = oFunctions(cnt);
					if(oFunction.FunctionKind & vsCMFunctionConstructor)
					{
						try
						{
						    if (strType == "DECIMAL" ||
							    strType == "FILETIME")
						    {
							    oFunction.StartPointOf(vsCMPartBody, vsCMWhereDefinition).CreateEditPoint().Insert(strInit);
							    oCM.Synchronize();
						    }
						    else
						    {
							    // add the initializer into the constructor
							    oFunction.AddInitializer(strInit);
						    }
						}
						catch (e)
						{
					                var L_ErrMsg1_Text = "无法更新类构造函数";
					                wizard.ReportError( L_ErrMsg1_Text );
			        		        throw e;
						}
						
						break;
					}
				}
			}

			if (wizard.FindSymbol("CONTROL_VARIABLE"))
			{
				var strControlType = wizard.FindSymbol("CONTROL_TYPE");

				if (!bUpdate)
				{
					var oDDXFunc = Class.Functions.Find("DoDataExchange");
					var bOCX = false;
					if (typeof(oDDXFunc) != "undefined")
					{
						var strFuncBody = "DDX_";
						if (wizard.FindSymbol("VARIABLE_CATEGORY") == "Control")
						{
							strFuncBody += "Control";
						}
						else if (wizard.FindSymbol("VARIABLE_CATEGORY") != "Value")
						{
							bOCX = true;
							strFuncBody += GetControlDDXType(strType);
						}
						else
						{
							strFuncBody += GetDDXType(strControlType, strType);
						}

						strFuncBody += "(pDX, ";
						strFuncBody += wizard.FindSymbol("CONTROL_NAME");
						strFuncBody += ", ";
						if (bOCX)
						{
							strFuncBody += "DISPID(";
							strFuncBody += wizard.FindSymbol("PROP_DISPID");
							strFuncBody += "), ";
						}
						strFuncBody += wizard.FindSymbol("VARIABLE_NAME");
						strFuncBody += ");\r\n";
						try
						{
							var newFuncBody = oDDXFunc.BodyText + strFuncBody;
							oDDXFunc.BodyText = newFuncBody;
						}
						catch (e)
						{
					                var L_ErrMsg1_Text = "无法更新 DoDataExchange 方法";
					                wizard.ReportError( L_ErrMsg1_Text );
			        		        throw e;
						}
					}
				}

				if (IsActiveXControl(strControlType) && wizard.FindSymbol("CLASS_NAME"))
				{
					var strHeader = wizard.FindSymbol("HEADER_FILE");
					RenderAddTemplate(wizard, "wrapper.h", strHeader, selProj.ProjectItems, false);
					RenderAddTemplate(wizard, "wrapper.cpp", wizard.FindSymbol("IMPL_FILE"), selProj.ProjectItems, false);
					var strFileName = Class.Location(vsCMWhereDefault);
					if (!DoesIncludeExist(selProj,'"' + strHeader + '"', strFileName))
						oCM.AddInclude("\"" + strHeader + "\"", strFileName, vsCMAddPositionEnd);

					if (wizard.FindSymbol("INCLUDE_PICTURE"))
					{
						oCM.AddInclude("\"_Picture.h\"", strHeader, vsCMAddPositionEnd);
						RenderAddTemplate(wizard, "_Picture.h", "_Picture.h", selProj.ProjectItems, false);
					}

					if (wizard.FindSymbol("INCLUDE_FONT"))
					{
						oCM.AddInclude("\"_Font.h\"", strHeader, vsCMAddPositionEnd);
						RenderAddTemplate(wizard, "_Font.h", "_Font.h", selProj.ProjectItems, false);
					}
				}
			}
		}
		else
		{
			newVariable = Class.Variables.Find(strName);
		}
		var extenderName = ExtenderFromType(strType);

		if (extenderName != "")
		{
			var MinValue = wizard.FindSymbol("MIN_VALUE");
			var MaxValue = wizard.FindSymbol("MAX_VALUE");
			var MaxChars = wizard.FindSymbol("MAX_CHARS");
			if ((extenderName == "MFCDialogStringVariable" && MaxChars != "") ||
				(MinValue != "" || MaxValue != ""))
			{
				var L_TRANSACTION_Text = "添加 DDV ";

				var extender = newVariable.Extender(extenderName);
				if (extender)
				{
					if (extenderName == "MFCDialogStringVariable")
					{
						extender.MaxChars = MaxChars;
					}
					else
					{
						if (MinValue != "")
							extender.MinValue = MinValue;
						if (MaxValue != "")
							extender.MaxValue = MaxValue;
					}
				}
			}
		}


		try
		{
			IncludeCodeElementDeclaration(selProj, strType, Class.Location(vsCMWhereDefault));
		}
		catch(e)
		{
			//don't display the error in case base class was not found: the warning was already displayed in HTML script
			//var L_ErrMsg1_Text = "Unable to find base class definition: ";
			//wizard.ReportError( L_ErrMsg1_Text + e.description);
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

function FindAndModifyInitInstance(oCM, strAfxInitFuncName)
{
	var oClasses = oCM.GetClassesDerivedFrom("CWinApp");
	if (oClasses)
	{
		for (var nCntr = 1; nCntr <= oClasses.Count; nCntr++)
		{
			var oClass = oClasses(nCntr);
			if (oClass.Name != "COleControlModule")
			{
				var oInitInstance = oClass.Functions.Find("InitInstance");
				if (oInitInstance)
				{
					//Search  AfxInitRichEdit or AfxInitRichEdit2 and add TODO: comment if not found.
					var strBody = oInitInstance.BodyText;
					var nCurPos = strBody.indexOf(strAfxInitFuncName);
					if (nCurPos == -1)
					{
						var L_InfoRichEdit2_Text = "使用 Rich Edit 控件需要调用 ";
						L_InfoRichEdit2_Text =  L_InfoRichEdit2_Text + strAfxInitFuncName + "().";
						wizard.ReportError(L_InfoRichEdit2_Text);
						var oEditPoint = oInitInstance.StartPointOf(vsCMPartBody, vsCMWhereDefinition).CreateEditPoint();
						oEditPoint.Insert("//TODO: call " + strAfxInitFuncName + "() to initialize richedit2 library.\n");
					}
				}
			}
		}
	}
}

function RichEditInit(oCM)
{
    try
	{
        //Is it RichEdit class variable?
	    var strCtrlType = wizard.FindSymbol("CONTROL_TYPE");
        var strAfxInitFuncName = "";
        if (strCtrlType == "RichEdit20A")
        {
			strAfxInitFuncName="AfxInitRichEdit2";

		}
		if (strCtrlType == "RICHEDIT")
		{
			strAfxInitFuncName="AfxInitRichEdit";
		}

        if (strAfxInitFuncName == "")
		{
		   return false;
		}

		FindAndModifyInitInstance(oCM, strAfxInitFuncName);
    }
    catch(e)
    {
        throw e;
    }
}

function IsActiveXControl(strControlType)
{
	try
	{
		// ActiveXContol type string is persisted as its coclass' GUID, it must contain the '{' and '}' chars
		//
		if(strControlType.indexOf("{") != -1 && strControlType.indexOf("}") != -1)
			return true;
		return false;
	}
	catch(e)
	{
		throw e;
	}
}
function GetControlDDXType(strControlType)
{
	try
	{
		var strDDXControlType = "OCInt";

		switch(strControlType.toLowerCase())
		{
			case "float":
			case "double":
				strDDXControlType = "OCFloat";
				break;
			case "BOOL":
				strDDXControlType = "OCBool";
				break;
			case "OLE_COLOR":
				strDDXControlType = "OCColor";
				break;
			case "short":
				strDDXControlType = "OCShort";
				break;
			case "cstring":
				strDDXControlType = "OCText";
				break;
			default:
				break;
		}
		return strDDXControlType;
	}
	catch(e)
	{
		throw e;
	}
}

function GetDDXType(strControlType, strVarType)
{
	try
	{
		var strDDXType = "Text";

		switch(strControlType)
		{
			case "CHECK":
				strDDXType = "Check";
				break;
			case "RADIO":
				strDDXType = "Radio";
				break;
			case "LISTBOX":
				if (strVarType == "CString")
					strDDXType = "LBString";
				else
					strDDXType = "LBIndex";
				break;
			case "COMBOBOX":
			case "ComboBoxEx32":
				if (strVarType == "CString")
					strDDXType = "CBString";
				else
					strDDXType = "CBIndex";
				break;
			case "SCROLLBAR":
				strDDXType = "Scroll";
				break;
			case "SysMonthCal32":
				strDDXType = "MonthCalCtrl";
				break;
			case "SysDateTimePick32":
				strDDXType = "DateTimeCtrl";
				break;
			case "msctls_trackbar32":
				strDDXType = "Slider";
				break;
			case "SysIPAddress32":
				strDDXType = "IPAddress";
				break;
			case "EDIT":
			case "RICHEDIT":
			case "RichEdit20A":
			case "LTEXT":
			case "CTEXT":
			case "RTEXT":
				strDDXType = "Text";
				break;
			default:
				break;
		}
		return strDDXType;
	}
	catch(e)
	{
		throw e;
	}
}

function ExtenderFromType(strVariableType)
{
	try
	{
		var retExtender = "";

		switch(strVariableType)
		{
		case "BYTE" :
		case "CHAR" :
		case "char" :
		case "short" :
		case "SHORT" :
		case "int" :
		case "INT" :
		case "UINT" :
		case "unsigned int" :
		case "unsigned" :
		case "long" :
		case "LONG" :
		case "DWORD" :
		case "float" :
		case "FLOAT" :
		case "double" :
		case "DOUBLE" :
			retExtender =  "MFCDialogNumberVariable";
			break;

		case "CString" :
			retExtender =  "MFCDialogStringVariable";
			break;

		case "COleCurrency" :
			retExtender =  "MFCDialogCurrencyVariable";
			break;

		case "COleDateTime" :
			retExtender =  "MFCDialogDateTimeVariable";
			break;

		}

		return retExtender;
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
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFLYK/eaiREzF
// SIG // 6+iDH2ITO4cQvTYDoIIVgjCCBMMwggOroAMCAQICEzMA
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
// SIG // L54/LlUWa8kTo/0xggTSMIIEzgIBATCBkDB5MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSMwIQYDVQQDExpNaWNyb3NvZnQg
// SIG // Q29kZSBTaWduaW5nIFBDQQITMwAAAQosea7XeXumrAAB
// SIG // AAABCjAJBgUrDgMCGgUAoIHrMBkGCSqGSIb3DQEJAzEM
// SIG // BgorBgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgor
// SIG // BgEEAYI3AgEVMCMGCSqGSIb3DQEJBDEWBBTjEkNW0vlW
// SIG // XriLWG/cZ4oIhZ7pFTCBigYKKwYBBAGCNwIBDDF8MHqg
// SIG // YIBeAGQAZQBmAGEAdQBsAHQAXwBmADIAOQA0AGIAMABh
// SIG // AGQALQAwADQAYQBlAC0ANAA1AGUAMwAtADgAMwAxADAA
// SIG // LQAwAGYAZABiAGMANwBmADkAZgBjAGQAOAAuAGoAc6EW
// SIG // gBRodHRwOi8vbWljcm9zb2Z0LmNvbTANBgkqhkiG9w0B
// SIG // AQEFAASCAQA5zol1M0SXSuzXkrHH3z6SiF1vTW8epCwq
// SIG // 76siORjJVnjsQrzk9bRwatGrQT6NQosQ+s10GFo9upBK
// SIG // adS+RGYLq5GoCfgVwhcKslV3HxxAKUE4J5pG7MPXRe8H
// SIG // SorRSsWlZu9E4yKgealla0edrLZ1ilo0psG5YKOGBb0u
// SIG // LpkmGt1xlKDax2D/B5Xw2PteelRANoQuUBJnwVOhCTlh
// SIG // cC/4ULmAtSJkybu03GvJBzyzsIwtrVSL+7ZEVjNalhPw
// SIG // ToAeUFwjrlTQemGl/Din17Cc0WoXzMnCV6SfD3MwBrLS
// SIG // Jv8irR/Eg4uMdhjSNRdPCMUJHx19gvc5o835d7Vz3tS4
// SIG // oYICKDCCAiQGCSqGSIb3DQEJBjGCAhUwggIRAgEBMIGO
// SIG // MHcxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xITAfBgNVBAMTGE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQQITMwAAAJzu/hRV
// SIG // qV01UAAAAAAAnDAJBgUrDgMCGgUAoF0wGAYJKoZIhvcN
// SIG // AQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcN
// SIG // MTYwNjIwMjIwNDQwWjAjBgkqhkiG9w0BCQQxFgQUJz7R
// SIG // 9p4sv9Drd7EztM06q+tjWTkwDQYJKoZIhvcNAQEFBQAE
// SIG // ggEAGSD0RkMSmqYuJbkl9hVx6iLMR2ZjbMXwBN6+wekR
// SIG // KmnKqySgCOR5s3rMP+N+Busj/tmI6pGNcLVWT1U6yHGR
// SIG // by7GpPyQvR2utwDgQPdr/GY2qNQ8xs7ybxed+IIr6zLH
// SIG // u6SNf2+8ZwS0RAVPT9yF+ki2N2uE+delsQDo2DIKKHS4
// SIG // Q7BFyIjUzrRBCDA/GUoY3/SsmdWtwyQQH8A7NIzW4W2r
// SIG // V0w/eA+Y+SJLg5tEbMaecs81+FnO0PSXXf08qAK5STlU
// SIG // o3kSf2vojhkgR6k6oF6drg9flJfcUVHIPyYrHrTeaapX
// SIG // X13JevUlq/YxM6VeT+OtR5nBMmPRzB3rXEy2WQ==
// SIG // End signature block
