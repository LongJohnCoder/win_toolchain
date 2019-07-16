// Copyright (c) Microsoft Corporation. All rights reserved.
// Script for Add Property Wizard

var aryParamVT = new Array;
var aryParamTypeNames = new Array;
var aryParamAttribs = new Array;
var bEmbeddedIDL = false;

function OnPrep(selProj, selObj)
{
	var L_WizardDialogTitle_Text = "添加属性向导";
	return PrepCodeWizard(selProj, L_WizardDialogTitle_Text);
}

function OnFinish(selProj, oInterface)
{
	var oCM;
	try
	{
		oCM	= selProj.CodeModel;
		oCM.Synchronize();

		var L_TRANSACTION_Text = "添加属性";
		oCM.StartTransaction(L_TRANSACTION_Text);

		if (typeDynamicLibrary == selProj.Object.Configurations(1).ConfigurationType)
			wizard.AddSymbol("DLL", true);
		else
			wizard.AddSymbol("DLL", false);

		var bMFC = wizard.FindSymbol("MFC_CLASS");

		// IDL changes
		//
		if (oInterface.Language==vsCMLanguageIDL)
		{
			bEmbeddedIDL = false;
		}
		else
		{
			bEmbeddedIDL = true;
		}

		var bIsManaged = oInterface.IsManaged;

		if (bIsManaged)
		{
			AddToManaged(oInterface, true);
		}
		else
		{
			InitParams(bMFC);
			var strAttributes = GetAttributes();

			if (bMFC)
				AddToIDLMFC(oInterface, strAttributes);
			else
			{
				AddToIDL(oInterface, strAttributes);
			}
		}

		// Class changes
		//

		var aryClasses = new Array();
		GetInterfaceClass(oCM, oInterface.Name, oInterface.FullName, aryClasses, true);
		for (var nIndex = 0; nIndex < aryClasses.length; nIndex++)
		{
			var oClass = aryClasses[nIndex];

			// same code for COleControl-derived class
			if (bMFC && oClass.IsDerivedFrom("CCmdTarget"))
				AddToClassMFC(oClass, selProj);
			// not CCmdTarget-derived
			else if (bIsManaged)
				AddToManaged(oClass, false);
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

function AddToClass(oClass, oProj)
{
	try
	{
		var strExternalName	= wizard.FindSymbol("EXTERNAL_NAME");
		var strType			= wizard.FindSymbol("TYPE");
		var strReturnType	= wizard.FindSymbol("RETURN_TYPE");
		var bGenerateGet	= wizard.FindSymbol("GENERATE_GET");
		var bGeneratePut	= wizard.FindSymbol("GENERATE_PUT");
		var bPropPutRef		= wizard.FindSymbol("PROPPUTREF");
		var nNumParams		= wizard.FindSymbol("NUM_PARAMETERS");

		// if derived from CComObjectRootEx or interface
		// add prototype and implementation
		var strCPP = oClass.Location(vsCMWhereDefault);
		strCPP = strCPP.substr(strCPP.lastIndexOf("\\")+1);
		strCPP = strCPP.substring(0, strCPP.lastIndexOf(".")+1) + "cpp";
		if (!oProj.Object.Files(strCPP))
			strCPP = "";

		var oGetFunction = false;
		var oPutFunction = false;

		var config = oProj.Object.Configurations(1);
		var MidlTool = config.Tools("VCMidlTool");
		var bDefaultUnsigned = (MidlTool.DefaultCharType==midlCharUnsigned);

		var strParams = "";
		for (nCntr = 0; nCntr < nNumParams; nCntr++)
		{
			if (nCntr > 0)
				strParams += ", ";
			if (aryParamTypeNames[nCntr].substr(0, 10) == "SAFEARRAY(")
			{
				strParams += "SAFEARRAY * " + aryParamTypeNames[nCntr].substr(aryParamTypeNames[nCntr].indexOf(')') + 2);
			}
			else
				strParams += AddUnsignedToChar(aryParamTypeNames[nCntr], bDefaultUnsigned)
		}
		if (strParams.length)
			strParams += ", ";


		strType = AddUnsignedToChar(strType, bDefaultUnsigned);
		strReturnType = AddUnsignedToChar(strReturnType, bDefaultUnsigned);

		if (bGenerateGet)
		{
			oGetFunction = oClass.AddFunction("get_" + strExternalName + "(" + strParams + strType + "* pVal)", vsCMFunctionComMethod, strReturnType, vsCMAddPositionEnd, vsCMAccessPublic, strCPP);
			if (oGetFunction)
				oGetFunction.BodyText = GetFunctionBodyForReturnType(strReturnType);
		}
		if (bGeneratePut)
		{
			if (bPropPutRef)
				oPutFunction = oClass.AddFunction("putref_" + strExternalName + "(" + strParams + strType + " newVal)", vsCMFunctionComMethod, strReturnType, vsCMAddPositionEnd, vsCMAccessPublic, strCPP);
			else
				oPutFunction = oClass.AddFunction("put_" + strExternalName + "(" + strParams + strType + " newVal)", vsCMFunctionComMethod, strReturnType, vsCMAddPositionEnd, vsCMAccessPublic, strCPP);
			if (oPutFunction)
				oPutFunction.BodyText = GetFunctionBodyForReturnType(strReturnType);
		}
	}
	catch(e)
	{
		throw e;
	}
}

function AddToClassMFC(oClass, oProj)
{
	try
	{
		var strExternalName			= wizard.FindSymbol("EXTERNAL_NAME");
		var strType					= wizard.FindSymbol("TYPE");
		var strTypeVT				= wizard.FindSymbol("TYPE_VT");
		var strVariableName			= wizard.FindSymbol("VARIABLE_NAME");
		var strNotificationFunction	= wizard.FindSymbol("NOTIFICATION_FUNCTION");
		var strGetFunction			= wizard.FindSymbol("GET_FUNCTION");
		var strSetFunction			= wizard.FindSymbol("SET_FUNCTION");
		var bStock					= wizard.FindSymbol("STOCK");
		var bMemberVariable			= wizard.FindSymbol("MEMBER_VARIABLE");
		var nNumParams				= wizard.FindSymbol("NUM_PARAMETERS");
		var bDefaultProperty		= wizard.FindSymbol("DEFAULT_PROPERTY");
		var strDispid				= wizard.FindSymbol("DISPID");

		var strClassName = oClass.Name;

		// add to Dispatch map
		var oMap = oClass.Maps.Find("DISPATCH");
		if (bStock)
		{
			oMap.AddEntry(wizard.FindSymbol("STOCK_MACRO"), vsCMAddPositionEnd);
		}
		else
		{
			var config = oProj.Object.Configurations(1);
			var MidlTool = config.Tools("VCMidlTool");
			var bDefaultUnsigned = (MidlTool.DefaultCharType==midlCharUnsigned);

			if (bMemberVariable)
			{
				// add to dispatch map
				var strMapItem;
				if (strNotificationFunction.length)
				{
					// add notification function
					var strCPP = oMap.Location(vsCMWhereDefault);
					strCPP = strCPP.substr(strCPP.lastIndexOf("\\")+1);
					var oFunction = oClass.AddFunction(strNotificationFunction, vsCMFunctionFunction, "void", vsCMAddPositionEnd, vsCMAccessProtected, strCPP);
					oFunction.BodyText = GetFunctionBodyForSet(oClass);
					strMapItem = "DISP_PROPERTY_NOTIFY_ID";
				}
				else
					strMapItem = "DISP_PROPERTY_ID";
				strMapItem += "(" + strClassName;
				strMapItem += ', "' + strExternalName + '"';
				strMapItem += ", dispid" + strExternalName;
				strMapItem += ", " + strVariableName;

				if (strNotificationFunction.length)
					strMapItem += ", " + strNotificationFunction;
				strMapItem += ", " + strTypeVT + ")";

				oMap.AddEntry(strMapItem, vsCMAddPositionEnd);

				// add member variable
				if (strType == "BSTR")
					oClass.AddVariable(strVariableName, "CString", vsCMAddPositionEnd, vsCMAccessProtected);
				else
				{
					strType = AddUnsignedToChar(strType, bDefaultUnsigned);
					oClass.AddVariable(strVariableName, strType, vsCMAddPositionEnd, vsCMAccessProtected);
				}
			}
			// Get/Set functions
			else
			{
				// add to dispatch map
				var strMapItem;
				if (nNumParams)
					strMapItem = "DISP_PROPERTY_PARAM_ID";
				else
					strMapItem = "DISP_PROPERTY_EX_ID";

				strMapItem += "(" + strClassName;
				strMapItem += ', "' + strExternalName + '"';
				strMapItem += ", dispid" + strExternalName;
				if (strGetFunction.length)
					strMapItem += ", " + strGetFunction;
				else
					strMapItem += ", GetNotSupported";
				if (strSetFunction.length)
					strMapItem += ", " + strSetFunction;
				else
					strMapItem += ", SetNotSupported";
				strMapItem += ", " + strTypeVT;

				if (nNumParams)
				{
					strMapItem += ",";
					for (nCntr = 0; nCntr < aryParamVT.length; nCntr++)
					{
							strMapItem += " " + aryParamVT[nCntr];
					}
				}
				strMapItem += ")";
				oMap.AddEntry(strMapItem, vsCMAddPositionEnd);


				// add Get and Set functions
				var strCPP = oMap.Location(vsCMWhereDefault);
				strCPP = strCPP.substr(strCPP.lastIndexOf("\\")+1);
				var oGetFunction = false;
				var oSetFunction = false;

				var strParams = "";
				for (nCntr = 0; nCntr < nNumParams; nCntr++)
				{
					if (nCntr > 0)
						strParams += ", ";
					if (aryParamTypeNames[nCntr].substr(0, 4) == "BSTR" &&
						aryParamTypeNames[nCntr].substr(0, 5) != "BSTR*" &&
						aryParamTypeNames[nCntr].substr(0, 6) != "BSTR *")
					{
						strParams += "LPCTSTR " + aryParamTypeNames[nCntr].substr(5);
					}
					else
						strParams += AddUnsignedToChar(aryParamTypeNames[nCntr], bDefaultUnsigned)
				}

				strType = AddUnsignedToChar(strType, bDefaultUnsigned);
				if (strGetFunction.length)
				{
					oGetFunction = oClass.AddFunction(strGetFunction + "(" + strParams + ")", vsCMFunctionFunction, strType, vsCMAddPositionEnd, vsCMAccessProtected, strCPP);
					if (oGetFunction)
						oGetFunction.BodyText = GetFunctionBodyForReturnType(strType);
				}
				if (strSetFunction.length)
				{
					if (strParams.length)
						strParams += ", ";
					if (strType == "BSTR")
						strType = "LPCTSTR";
					oSetFunction = oClass.AddFunction(strSetFunction + "(" + strParams + strType + " " + GetParamName(strType) + ")", vsCMFunctionFunction, "void", vsCMAddPositionEnd, vsCMAccessProtected, strCPP);
					if (oSetFunction)
						oSetFunction.BodyText = GetFunctionBodyForSet(oClass);
				}
			}

			// add dispidXXX in enum in Class.h
			var oEnum;
			if (oClass.Enums.Count)
				oEnum = oClass.Enums(1);
			else
				oEnum = oClass.AddEnum("", vsCMAddPositionEnd);

			var oEnumMember = oEnum.AddMember("dispid" + strExternalName, vsCMAddPositionEnd);
			oEnumMember.InitExpression = strDispid;

			if (bDefaultProperty)
			{
				var strMapItem = "DISP_DEFVALUE";
				strMapItem += "(" + strClassName;
				strMapItem += ', "' + strExternalName + '")';
				oMap.AddEntry(strMapItem, vsCMAddPositionEnd);
			}
		}
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
		var strExternalName		= wizard.FindSymbol("EXTERNAL_NAME");
		var strType				= wizard.FindSymbol("TYPE");
		var strReturnType		= wizard.FindSymbol("RETURN_TYPE");
		var bGenerateGet		= wizard.FindSymbol("GENERATE_GET");
		var bGeneratePut		= wizard.FindSymbol("GENERATE_PUT");
		var bPropPutRef			= wizard.FindSymbol("PROPPUTREF");
		var nNumParams			= wizard.FindSymbol("NUM_PARAMETERS");
		var strInterfaceType	= wizard.FindSymbol("INTERFACE_TYPE");
		var strDispid			= wizard.FindSymbol("DISPID");

		var oGetFunction = false;
		var oPutFunction = false;

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

		if (strAttributes.length > 0)
			strAttributes = ', ' + strAttributes;

		if (bGenerateGet)
		{
			var strReturnType1;

			if (strInterfaceType == "dual" || strInterfaceType == "dispinterface")
				strReturnType1 = '	[propget, id(' + strDispid + ')' + strAttributes + '] HRESULT';
			else
				strReturnType1 = '	[propget' + strAttributes + '] ' + strReturnType;

			oGetFunction = oInterface.AddFunction(strExternalName + strParams, vsCMFunctionFunction, strReturnType1, vsCMAddPositionEnd, vsCMAccessDefault);
		}

		if (bGeneratePut)
		{
			var strReturnType1;
			var strPutType = "propput";
			if (bPropPutRef)
				strPutType = "propputref";

			if (strInterfaceType == "dual" || strInterfaceType == "dispinterface")
				strReturnType1 = '	[' + strPutType + ', id(' + strDispid + ')' + strAttributes + '] HRESULT';
			else
				strReturnType1 = '	[' + strPutType + strAttributes + '] ' + strReturnType;

			oPutFunction = oInterface.AddFunction(strExternalName + strParams, vsCMFunctionFunction, strReturnType1, vsCMAddPositionEnd, vsCMAccessDefault);
		}

		if (oGetFunction)
		{
			var strType1 = "[out, retval] " + strType + "*";
			oGetFunction.AddParameter("pVal", strType1, vsCMAddPositionEnd);
		}

		if (oPutFunction)
		{
			var strType1 = "[in] " + strType;
			oPutFunction.AddParameter("newVal", strType1, vsCMAddPositionEnd);
		}
	}
	catch(e)
	{
		throw e;
	}
}


function AddToManaged(oElement, bInterface)
{
	try
	{
		var strExternalName		= wizard.FindSymbol("EXTERNAL_NAME");
		var strType				= wizard.FindSymbol("TYPE");
		var bGenerateGet		= wizard.FindSymbol("GENERATE_GET");
		var bGeneratePut		= wizard.FindSymbol("GENERATE_PUT");

		var oGetFunction = false;
		var oPutFunction = false;
		var Kind = oElement.Kind;

		var strReturnType;

		if (bGenerateGet)
		{
			if (bInterface)
			{
				strReturnType = 'property ' + strType;
			}
			else
			{
				strReturnType = strType;
			}

			oGetFunction = oElement.AddFunction('get_' + strExternalName + '()',
				vsCMFunctionFunction, strReturnType, vsCMAddPositionEnd, vsCMAccessDefault);
		}

		if (bGeneratePut)
		{
			if (bInterface)
			{
				strReturnType = 'property void';
			}
			else
			{
				strReturnType = 'void';
			}

			oPutFunction = oElement.AddFunction('set_' + strExternalName + '(' + strType + ' newVal)',
				vsCMFunctionFunction, strReturnType, vsCMAddPositionEnd, vsCMAccessDefault);
		}
	}
	catch(e)
	{
		throw e;
	}
}


function AddToIDLMFC(oInterface, strAttributes)
{
	try
	{
		var strExternalName		= wizard.FindSymbol("EXTERNAL_NAME");
		var strType				= wizard.FindSymbol("TYPE");
		var bStock				= wizard.FindSymbol("STOCK");
		var bMemberVariable		= wizard.FindSymbol("MEMBER_VARIABLE");
		var nNumParams			= wizard.FindSymbol("NUM_PARAMETERS");
		var bDefaultProperty	= wizard.FindSymbol("DEFAULT_PROPERTY");
		var strDispid			= wizard.FindSymbol("DISPID");

		if (strAttributes.length > 0)
			strAttributes = ', ' + strAttributes;

		if (bStock)
		{
			var strType1 = "	[id(" + wizard.FindSymbol("STOCK_DISPID") + ")" + strAttributes + "] " + strType;
			oInterface.AddVariable(strExternalName, strType1, vsCMAddPositionEnd, vsCMAccessDefault);
			if (bDefaultProperty)
			{
				strType1 = "	[id(0)] " + strType;
				oInterface.AddVariable("_" + strExternalName, strType1, vsCMAddPositionEnd, vsCMAccessDefault);
			}
		}
		else
		{
			if (bMemberVariable)
			{
				var strType1 = "	[id(" + strDispid + ") " + strAttributes + "] " + strType;
				oInterface.AddVariable(strExternalName, strType1, vsCMAddPositionEnd, vsCMAccessDefault);
				if (bDefaultProperty)
				{
					strType1 = "	[id(0)] " + strType;
					oInterface.AddVariable("_" + strExternalName, strType1, vsCMAddPositionEnd, vsCMAccessDefault);
				}
			}
			else
			{
				if (nNumParams)
				{
					var oGetFunction = false;
					var oSetFunction = false;
					var oGetFunction2 = false;
					var oSetFunction2 = false;

					var strParams = "(";
					for (nCntr = 0; nCntr < nNumParams; nCntr++)
					{
						if (nCntr > 0)
							strParams += ", ";
						if (aryParamAttribs[nCntr].length)
							strParams += "[" + aryParamAttribs[nCntr] + "] ";
						strParams += aryParamTypeNames[nCntr];
					}
					strParams += ")";

					var strType1 = "	[id(" + strDispid + "), propget" + strAttributes + "] " + strType;
					oGetFunction = oInterface.AddFunction(strExternalName + strParams, vsCMFunctionFunction, strType1, vsCMAddPositionEnd, vsCMAccessDefault);
					if (bDefaultProperty)
					{
						strType1 = "	[id(0), propget" + strAttributes + "] " + strType;
						oGetFunction2 = oInterface.AddFunction("_" + strExternalName + strParams, vsCMFunctionFunction, strType1, vsCMAddPositionEnd, vsCMAccessDefault);
					}

					var strType1 = "	[id(" + strDispid + "), propput" + strAttributes + "] void";
					oSetFunction = oInterface.AddFunction(strExternalName + strParams, vsCMFunctionFunction, strType1, vsCMAddPositionEnd, vsCMAccessDefault);
					if (bDefaultProperty)
					{
						strType1 = "	[id(0), propput" + strAttributes + "] void";
						oSetFunction2 = oInterface.AddFunction("_" + strExternalName + strParams, vsCMFunctionFunction, strType1, vsCMAddPositionEnd, vsCMAccessDefault);
					}

					if (oSetFunction)
						oSetFunction.AddParameter(GetParamName(strType), strType, vsCMAddPositionEnd);
					if (oSetFunction2)
						oSetFunction2.AddParameter(GetParamName(strType), strType, vsCMAddPositionEnd);
				}
				else
				{
					var strType1 = "	[id(" + strDispid + ")" + strAttributes + "] " + strType;
					oInterface.AddVariable(strExternalName, strType1, vsCMAddPositionEnd, vsCMAccessDefault);
					if (bDefaultProperty)
					{
						strType1 = "	[id(0)" + strAttributes + "] " + strType;
						oInterface.AddVariable("_" + strExternalName, strType1, vsCMAddPositionEnd, vsCMAccessDefault);
					}
				}
			}
		}
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

		var strType	= wizard.FindSymbol("TYPE");
		if (strType.substr(0, 12) == "OLE_TRISTATE")
		{
			strType = "enum " + strType;
			wizard.AddSymbol("TYPE", strType);
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
		var strHelpContext		= wizard.FindSymbol("HELP_CONTEXT");
		var bBindable			= wizard.FindSymbol("BINDABLE");
		var bDefaultBind		= wizard.FindSymbol("DEFAULT_BIND");
		var bDefaultCollElem	= wizard.FindSymbol("DEFAULT_COLLELEM");
		var bDisplayBind		= wizard.FindSymbol("DISPLAY_BIND");
		var bHidden				= wizard.FindSymbol("HIDDEN");
		var bImmediateBind		= wizard.FindSymbol("IMMEDIATE_BIND");
		var bLocal				= wizard.FindSymbol("LOCAL");
		var bNonBrowsable		= wizard.FindSymbol("NON_BROWSABLE");
		var bRequestEdit		= wizard.FindSymbol("REQUEST_EDIT");
		var bRestricted			= wizard.FindSymbol("RESTRICTED");
		var bSource				= wizard.FindSymbol("SOURCE");

		var strAttributes = "";

		if (strHelpString != "")
			strAttributes += ', helpstring("' + strHelpString + '")';

		if (strHelpContext != "")
			strAttributes += ', helpcontext(' + strHelpContext + ')';

		if (bBindable)
			strAttributes += ", bindable";

		if (bDefaultBind)
			strAttributes += ", defaultbind";

		if (bDefaultCollElem)
			strAttributes += ", defaultcollelem";

		if (bDisplayBind)
			strAttributes += ", displaybind";

		if (bHidden)
			strAttributes += ", hidden";

		if (bImmediateBind)
			strAttributes += ", immediatebind";

		if (bLocal)
			strAttributes += ", local";

		if (bNonBrowsable)
			strAttributes += ", nonbrowsable";

		if (bRequestEdit)
			strAttributes += ", requestedit";

		if (bRestricted)
			strAttributes += ", restricted";

		if (bSource)
			strAttributes += ", source";

		if (strAttributes.length > 1)
			strAttributes = strAttributes.substr(2);

		return strAttributes;
	}
	catch(e)
	{
		throw e;
	}
}

function GetParamName(strType)
{
	try
	{
		var strParamName = "newVal";
		if (-1 != strType.indexOf("**"))
			strParamName = "ppVal";
		else if  (-1 != strType.indexOf("*"))
			strParamName = "pVal";
		return strParamName;
	}
	catch(e)
	{
		throw e;
	}
}

function GetFunctionBodyForSet(oClass)
{
	try
	{
		var strBody = "";
		var bDLL = wizard.FindSymbol("DLL");

		if (bDLL)
			strBody = "AFX_MANAGE_STATE(AfxGetStaticModuleState());\r\n\r\n";
		else
			strBody = "AFX_MANAGE_STATE(AfxGetAppModuleState());\r\n\r\n";

		var L_Comment1_Text = "\57\57 TODO: 在此添加属性处理程序代码\r\n";
		strBody += L_Comment1_Text;

		if (oClass.IsDerivedFrom("CDocument") || oClass.IsDerivedFrom("COleControl"))
			strBody += "\r\nSetModifiedFlag();\r\n";

		return strBody;
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
		var strComment;
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
			var L_Comment2_Text = "\57\57 TODO: 在此添加调度处理程序代码\r\n\r\n";
			strComment = L_Comment2_Text
		}
		else
		{
			var L_Comment3_Text = "\57\57 TODO: 在此添加实现代码\r\n\r\n";
			strComment = L_Comment3_Text;
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

			case "SCODE":
			case "HRESULT":
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
				strBody += strComment.substr(0, strComment.length-2);
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
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFHhRQ8VL85Qd
// SIG // Vo47q7FPzL4UhDY2oIIVgjCCBMMwggOroAMCAQICEzMA
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
// SIG // BgEEAYI3AgEVMCMGCSqGSIb3DQEJBDEWBBTbQ8ahZHKO
// SIG // 0fQ+Beva68kD/CgE4TCBigYKKwYBBAGCNwIBDDF8MHqg
// SIG // YIBeAGQAZQBmAGEAdQBsAHQAXwAwADYAZABlADkAOAA3
// SIG // AGEALQBmADcAMABkAC0ANAA4AGUAYQAtAGIAZgA0AGYA
// SIG // LQAxAGIAMgA3ADMAMgA2ADMANgBlADQAYQAuAGoAc6EW
// SIG // gBRodHRwOi8vbWljcm9zb2Z0LmNvbTANBgkqhkiG9w0B
// SIG // AQEFAASCAQB+hDFV8Rr9VrJG7dzuwYQrerUG55ugcg8t
// SIG // c4pW1YNyUmnl5ZQVzG0bjRcsI9IE95Lqo++V1PtjccvC
// SIG // V7t2cyvKRXUQRvziI7oSTcMpdII3cFyKmPtQJHpsjot4
// SIG // VOjPM76JZ81Cbuqy+lfKAiSfk7IfNqwIunuoHEiElmpl
// SIG // zl82Y9/tb++wUr6Nn4nSgwFmdBv1Sngm9z4WYqattoD2
// SIG // zsXs9LUYYLIlfitLZtoBdxkvB5rBZxig3fxHr9UOAgO1
// SIG // 5k64A3JIpvrxY2eNJBuso+0NCU16i7G5tlwSwKB2ZA7A
// SIG // dvxXcrs/kx2de5MtgdmqdIR1VhF+9ggLiipcwUxYp0iI
// SIG // oYICKDCCAiQGCSqGSIb3DQEJBjGCAhUwggIRAgEBMIGO
// SIG // MHcxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xITAfBgNVBAMTGE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQQITMwAAAJzu/hRV
// SIG // qV01UAAAAAAAnDAJBgUrDgMCGgUAoF0wGAYJKoZIhvcN
// SIG // AQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcN
// SIG // MTYwNjIwMjIwNDA3WjAjBgkqhkiG9w0BCQQxFgQUcG5e
// SIG // WgPT6NGfB+Dym6FCwXQqluswDQYJKoZIhvcNAQEFBQAE
// SIG // ggEAvWkvmwnOErHl+lWe4RcJ6bWF8i/iMwOxeoFmIL2i
// SIG // Hbacl2AKJ3fHbF2/1d1+rdRMmMtPaXvii8sFUlRBGvmc
// SIG // R8mwLmBAC2EAEHQ6uwx7CdR4HpkfyA/4JVuqnZyL5kpI
// SIG // SaShMn5RZT6ALA2KCcbB8pAoZC9eOHEUdMkYa36WEthd
// SIG // NUmdHG1EcEsDhWgQTcUf9KTYrjCPil8jap7ju8hA8bt7
// SIG // XxHu8ShvzaKRvP2/Zc5ipsG4/lJYqyu0rZeh1v4coDUe
// SIG // Y5a1O4Ff+FtEcjgH0KdUHoSgl8IPp4EITi+OE05XQWn4
// SIG // ukV01pm5bH2oHcKU1C3QV9/OL5TtN/hkNAHwvQ==
// SIG // End signature block
