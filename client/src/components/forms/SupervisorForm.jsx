import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { API_BASE_URL, indianZipRegex, indianPhoneRegex, styles, FormInput } from '../../config/constants';

// ==========================================
// 1. Validation Schema
// ==========================================
export const asthaMaaSchema = z.object({
    fullName: z.string().min(2, "Full Name is required").max(50, "Max 50 characters").regex(/^[a-zA-Z\s]+$/, "Letters only"),
    sdwOf: z.string().min(1, "This field is required"),
    dob: z.string().min(1, "Date of Birth is required"),
    guardianName: z.string().min(1, "Guardian Name is required"),
    state: z.object({ value: z.any(), label: z.string() }, { invalid_type_error: "State is required" }).nullable(),
    district: z.object({ value: z.any(), label: z.string() }, { invalid_type_error: "District is required" }).nullable(),
    block: z.string().min(1, "Block is required"),
    gramPanchayat: z.string().min(1, "Gram Panchayat is required"),
    cityVillage: z.string().min(1, "City/Village is required"),
    mobileNo: z.string().regex(indianPhoneRegex, "Valid Indian phone required"),
    pinCode: z.string().regex(indianZipRegex, "Valid 6-digit Pincode required").length(6, "Must be exactly 6 digits"),
    aadhaarAddress: z.string().min(5, "Full address is required")
});

// ==========================================
// 2. Component Definition
// ==========================================
const SupervisorForm = ({ onSuccess }) => {
    // --- State Management ---
    const [dbStates, setDbStates] = useState([]);
    const [dbDistricts, setDbDistricts] = useState([]);

    // Mocking the Astha Didi ID for the default print text
    const asthaDidiUniqueId = "123456";

    // --- Form Configuration ---
    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({
        resolver: zodResolver(asthaMaaSchema),
        mode: 'onChange',
        defaultValues: {
            fullName: '',
            sdwOf: '',
            dob: '',
            guardianName: '',
            state: null,
            district: null,
            block: '',
            gramPanchayat: '',
            cityVillage: '',
            mobileNo: '',
            pinCode: '',
            aadhaarAddress: ''
        }
    });

    const selectedState = watch("state");

    // --- Data Fetching (Side Effects) ---

    // Fetch Active States on component mount
    useEffect(() => {
        const fetchStates = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/states`);
                if (!res.ok) throw new Error("Failed to fetch states");
                const data = await res.json();
                setDbStates(data.map(s => ({ value: s.StateId, label: s.StateName })));
            } catch (error) {
                console.error("Error fetching states:", error);
                toast.error("Could not load states from server.");
            }
        };
        fetchStates();
    }, []);

    // Fetch Active Districts whenever the selected State changes
    useEffect(() => {
        const fetchDistricts = async () => {
            if (selectedState && selectedState.value) {
                try {
                    const res = await fetch(`${API_BASE_URL}/districts/${selectedState.value}`);
                    if (!res.ok) throw new Error("Failed to fetch districts");
                    const data = await res.json();
                    setDbDistricts(data.map(d => ({ value: d.DistId, label: d.DistName })));
                } catch (error) {
                    console.error("Error fetching districts:", error);
                    toast.error("Could not load districts from server.");
                }
            } else {
                setDbDistricts([]); // Reset if state is cleared
            }
        };
        fetchDistricts();
    }, [selectedState]);

    // --- Handlers ---

    const handleCancel = () => {
        reset();
    };

    /**
     * Safely retrieves the logged-in user's email from localStorage
     * @returns {string} The email address or an empty string
     */
    const getCurrentUserEmail = () => {
        try {
            const userStr = localStorage.getItem('loggedInUser');
            if (userStr) {
                const loggedInUser = JSON.parse(userStr);
                return loggedInUser.email || "";
            }
        } catch (error) {
            console.error("Error parsing user data from local storage", error);
        }
        return "";
    };

    const onSubmitSupervisor = async (data) => {
        const stateName = data.state ? data.state.label : "";
        const districtName = data.district ? data.district.label : "";
        const currentUserEmail = getCurrentUserEmail();

        // Package the data to match backend database expectations
        const dbPayload = {
            PerName: data.fullName,
            GuardianName: data.guardianName,
            SdwOf: data.sdwOf,
            DOB: data.dob,
            StateName: stateName,
            DistName: districtName,
            BlockName: data.block,
            GramPanchayet: data.gramPanchayat,
            CityVillage: data.cityVillage,
            Pincode: parseInt(data.pinCode),
            ContactNo: data.mobileNo,
            AadhaarAddress: data.aadhaarAddress,
            JoiningAmt: 105,       // Hardcoded from UI requirements
            WalletBalance: 26895,  // Hardcoded auto-calculation from UI requirements
            AsthaDidiId: asthaDidiUniqueId,
            CreatedBy: currentUserEmail
        };

        try {
            toast.loading("Saving Astha Maa data...", { toastId: 'savingSupervisor' });

            const response = await fetch(`${API_BASE_URL}/supervisor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbPayload)
            });

            toast.dismiss('savingSupervisor');

            if (response.ok) {
                toast.success("Success: Astha Maa saved successfully!", { position: "top-right" });
                handleCancel();
                if (onSuccess) onSuccess(); // Triggers the table refresh in the parent component
            } else {
                toast.error("Failed to save data. Please check backend logs.", { position: "top-right" });
            }
        } catch (error) {
            toast.dismiss('savingSupervisor');
            console.error("Submission Error:", error);
            toast.error("Network error. Could not reach the server.", { position: "top-right" });
        }
    };

    const onError = () => toast.error("Form Error: Please check the highlighted fields.", { position: "top-right" });

    // --- Render ---
    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <h5 style={{ color: '#696cff' }}>New General Member <span style={{ textDecoration: 'underline' }}>(Astha Maa)</span></h5>
            </div>

            <div style={styles.cardBody}>
                <form onSubmit={handleSubmit(onSubmitSupervisor, onError)}>

                    {/* Header Info Block */}
                    <div style={{ marginBottom: '24px' }}>
                        <h6 style={{ ...styles.sectionHeader, marginTop: 0, borderBottom: 'none', marginBottom: '10px' }}>
                            ASTHA MAA INFORMATION <span style={{ color: '#ff3e1d', textTransform: 'none' }}>(Astha Didi Unique ID: <span style={{ textDecoration: 'underline' }}>{asthaDidiUniqueId}</span> )</span> <span style={{ color: '#ff3e1d', textTransform: 'none', fontSize: '0.85rem' }}>Need to Print By default.</span>
                        </h6>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.9rem', color: '#566a7f', fontWeight: '500' }}>
                            <div>
                                Joining Amount: 105 <span style={{ color: '#ff3e1d', marginLeft: '5px', fontSize: '0.8rem' }}>Read only.</span>
                            </div>
                            <div>
                                Wallet Balance: 27,000 - 105 = 26,895 <span style={{ color: '#ff3e1d', marginLeft: '5px', fontSize: '0.8rem' }}>auto calculation and read only</span>
                            </div>
                        </div>
                    </div>

                    <h6 style={styles.sectionHeader}>PERSONAL DETAILS</h6>
                    <div style={styles.formGrid}>
                        <Controller name="fullName" control={control} render={({ field }) => (
                            <FormInput label={<>Full Name <span style={{ color: '#ff3e1d' }}>*</span></>} id="fullName" error={errors.fullName} type="text" maxLength={50} {...field} />
                        )} />
                        <Controller name="sdwOf" control={control} render={({ field }) => (
                            <FormInput label={<>S/D/W of <span style={{ color: '#ff3e1d' }}>*</span></>} id="sdwOf" error={errors.sdwOf} type="text" maxLength={50} {...field} />
                        )} />

                        {/* DOB with specific hint text */}
                        <div style={styles.inputGroup}>
                            <label htmlFor="dob" style={styles.label}>Date of Birth <span style={{ color: '#ff3e1d' }}>*</span></label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Controller name="dob" control={control} render={({ field }) => (
                                    <input id="dob" style={{ ...styles.input(!!errors.dob), flex: 1 }} type="date" {...field} />
                                )} />
                                <span style={{ color: '#ff3e1d', fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap' }}>(Eligible 12 to 45 Age)</span>
                            </div>
                            {errors.dob && <p style={styles.errorText}>{errors.dob.message}</p>}
                        </div>

                        <Controller name="guardianName" control={control} render={({ field }) => (
                            <FormInput label={<>Guardian Name <span style={{ color: '#ff3e1d' }}>*</span></>} id="guardianName" error={errors.guardianName} type="text" maxLength={50} {...field} />
                        )} />
                    </div>

                    <h6 style={styles.sectionHeader}>CONTACT DETAILS</h6>
                    <div style={styles.formGrid}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Select State <span style={{ color: '#ff3e1d' }}>*</span></label>
                            <Controller name="state" control={control} render={({ field }) => (
                                <Select {...field} options={dbStates} styles={styles.selectStyles(!!errors.state)} placeholder="Select State" />
                            )} />
                            {errors.state && <p style={styles.errorText}>{errors.state.message}</p>}
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>District <span style={{ color: '#ff3e1d' }}>*</span></label>
                            <Controller name="district" control={control} render={({ field }) => (
                                <Select {...field} options={dbDistricts} styles={styles.selectStyles(!!errors.district)} placeholder="Select District" isDisabled={!selectedState} />
                            )} />
                            {errors.district && <p style={styles.errorText}>{errors.district.message}</p>}
                        </div>
                        <Controller name="block" control={control} render={({ field }) => (
                            <FormInput label={<>Block <span style={{ color: '#ff3e1d' }}>*</span></>} id="block" error={errors.block} type="text" maxLength={50} {...field} />
                        )} />
                        <Controller name="gramPanchayat" control={control} render={({ field }) => (
                            <FormInput label={<>Word Name / Gram Panchayat Name <span style={{ color: '#ff3e1d' }}>*</span></>} id="gramPanchayat" error={errors.gramPanchayat} type="text" maxLength={50} {...field} />
                        )} />
                        <Controller name="cityVillage" control={control} render={({ field }) => (
                            <FormInput label={<>City/ Village Name <span style={{ color: '#ff3e1d' }}>*</span></>} id="cityVillage" error={errors.cityVillage} type="text" maxLength={50} {...field} />
                        )} />
                        <Controller name="mobileNo" control={control} render={({ field }) => (
                            <FormInput label={<>Mobile No. <span style={{ color: '#ff3e1d' }}>*</span></>} id="mobileNo" error={errors.mobileNo} type="tel" maxLength={15} {...field} />
                        )} />
                        <Controller name="pinCode" control={control} render={({ field }) => (
                            <FormInput label={<>Pin code no. <span style={{ color: '#ff3e1d' }}>*</span></>} id="pinCode" error={errors.pinCode} type="text" maxLength={6} {...field} />
                        )} />
                    </div>

                    <div style={styles.formGrid}>
                        <Controller name="aadhaarAddress" control={control} render={({ field }) => (
                            <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
                                <label htmlFor="aadhaarAddress" style={styles.label}>Address as per Aadhaar Card <span style={{ color: '#ff3e1d' }}>*</span></label>
                                <textarea id="aadhaarAddress" style={{ ...styles.input(!!errors.aadhaarAddress), resize: 'vertical', minHeight: '80px' }} {...field} />
                                {errors.aadhaarAddress && <p style={styles.errorText}>{errors.aadhaarAddress.message}</p>}
                            </div>
                        )} />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '16px', marginTop: '32px' }}>
                        <button type="submit" style={styles.btnPrimary}>Submit</button>
                        <button type="button" style={styles.btnOutline} onClick={handleCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupervisorForm;