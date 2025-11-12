import {red} from '@material-ui/core/colors';
import {createMuiTheme} from '@material-ui/core/styles';
import {PRIMARY_COLOR} from "./constants";

const theme = createMuiTheme( {
    typography: {
        fontFamily: [
            'Open Sans'
        ].join(','),
    },
    palette: {
        type: 'dark',
        primary: {
            main: PRIMARY_COLOR,
        },
        secondary: {
            main: '#19857b',
        },
        error: {
            main: red.A400,
        }
    },
    overrides: {
        MuiInputBase: {
            root: {
                fontWeight: 700,
                backgroundColor: '#fff',
                color: '#424242',
                "&.Mui-disabled": {
                    color: '#424242'
                }
            }
        },
        MuiIconButton: {
            root: {
                color: '#424242'
            }
        },
        MuiInput: {
            root: {
                "&.MuiInput-underline::after": {
                    borderBottom: 'none'
                }
            }
        },
        MuiButtonBase: {
            root: {
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 16,
                paddingRight: 16
            }  
        },
        MuiOutlinedInput: {
            input: {
                paddingTop: '22px !important',
                paddingBottom: '14px !important',
                paddingLeft: '14px !important',
                paddingRight: '14px !important',
            },
            notchedOutline: {
                borderColor: '#fff',
                color: '#424242'
            },
            root: {
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: 'rgba(0,0,0,0)',
                    fontWeight: 700,
                    color: '#424242'
                }
            }
        },
        MuiFormLabel: {
            root: {
                color: '#424242',
                fontWeight: 700,
                "&.Mui-focused": {
                    color: '#fff',
                    fontWeight: 700
                },
                "&.MuiInputLabel-shrink": {
                    color: '#424242',
                    fontWeight: 700,
                    transform: 'translate(14px, 1px) scale(0.75)',
                    backgroundColor: 'rgba(0,0,0,0)'
                },
                "&.Mui-disabled": {
                    color: '#424242'
                }
            }
        },
        MuiFormControlLabel: {
            label: {
                "&.Mui-disabled": {
                    color: '#424242'
                }
            }
        },
        MuiInputLabel: {
            outlined: {
                "&.MuiInputLabel-shrink": {
                    color: '#424242',
                    fontWeight: 700,
                    transform: 'translate(14px, 1px) scale(0.75)',
                    backgroundColor: 'rgba(0,0,0,0)'
                }
            },
            animated: {
                zIndex: 1,
                transform: 'translate(14px, 20px) scale(1)',
                pointerEvents: 'none'
            },
            formControl: {
                color: '#424242',
                fontWeight: 700
            }
        },
        MuiAutocomplete: {
            popupIndicator: {
                color: '#424242'
            },
            clearIndicator: {
                color: '#424242'
            },
            inputRoot: {
                padding: '0px !important'
            }
        },
        MuiDataGrid: {
            root: {
                '& .MuiDataGrid-colCellTitle': {
                    fontWeight: 700
                }
            }
        },
        MuiTabs: {
            flexContainer: {
                backgroundColor: PRIMARY_COLOR
            }
        },
        MuiTab: {
            wrapper: {
                fontWeight: 700
            }
        },
        MuiTablePagination: {
            select: {
                backgroundColor: '#424242'
            },
            input: {
                backgroundColor: '#424242'
            }
        },
        MuiSelect: {
            select: {
                fontWeight: 400,
                "&:not([multiple]) option": {
                    backgroundColor: '#424242',
                    fontWeight: 400,
                    color: '#fff'
                },
                "&:not([multiple]) option:checked": {
                    backgroundColor: '#424242 !important'
                }
            }
        },
        MuiDataGridFilterForm: {
            columnSelect: {
                "& label": {
                    color: '#fff',
                    fontWeight: 400
                },
                "& select": {
                    fontSize: 14
                }
            },
            operatorSelect: {
                display: 'none'
            },
            filterValueInput: {
                marginLeft: 5,
                "& label": {
                    color: '#fff',
                    fontWeight: 400,
                },
                "& input": {
                    fontWeight: 400,
                    paddingLeft: 5,
                    fontSize: 14
                },
                "& select": {
                    fontSize: 14
                },
                "& select option:nth-child(1)": {
                    display: 'none'
                }
            }
        },
        MuiPickersCalendarHeader: {
            iconButton: {
                color: '#fff'
            }
        }
    }
} );

export default theme;